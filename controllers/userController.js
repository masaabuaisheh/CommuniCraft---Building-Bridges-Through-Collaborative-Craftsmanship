const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/dbconnection');
const randomstring = require('randomstring');

const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;

const register = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const verificationToken = randomstring.generate(); // Generate a random verification token

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).send({ msg: err });
        }

        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).send({ msg: err });
                });
            }

            db.query(
                `INSERT INTO users (name, email, bio, role, token, location, phonenumber, skills, loggedout) 
                VALUES (?, ?, ?, 'User', ?, ?, ?, ?,'False')`,
                [req.body.name, req.body.email, req.body.bio, verificationToken, req.body.location, req.body.phonenumber, req.body.skills],
                (err, userResult) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).send({ msg: err });
                        });
                    }

                    const userId = userResult.insertId; // Get the ID of the newly inserted user

                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).send({ msg: err });
                            });
                        }

                        db.query(
                            `INSERT INTO loginauthentication (username, password) 
                            VALUES (?, ?)`,
                            [req.body.username, hash],
                            (err, loginResult) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).send({ msg: err });
                                    });
                                }

                                db.query(
                                    `INSERT INTO login_user (user_id, username) 
                                    VALUES (?, ?)`,
                                    [userId, req.body.username],
                                    (err, loginUserResult) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                res.status(500).send({ msg: err });
                                            });
                                        }

                                        // Commit the transaction
                                        db.commit((err) => {
                                            if (err) {
                                                return db.rollback(() => {
                                                    res.status(500).send({ msg: err });
                                                });
                                            }

                                            // Send response to client indicating successful registration
                                            const verificationMessage = `The user has been registered. Please verify your email using this link: localhost:4400/APIS/verify-email?token=${verificationToken}`;
                                            res.status(200).send({ msg: verificationMessage });
                                        });
                                    }
                                );
                            }
                        );
                    });
                }
            );
        });
    });
};



const verifyEmail = (req, res) => {
    const { token } = req.query; // Get the verification token from the request query parameters

    if (!token) {
        return res.status(400).send({ msg: 'Verification token is missing' });
    }

    // Query to update user's email verification status
    db.query(
        'UPDATE users SET messages = ? WHERE token = ?',
        ['verified successfully',token],
        (err, result) => {
            if (err) {
                return res.status(500).send({ msg: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).send({ msg: 'Invalid verification token' });
            }

            // Send success response
            res.status(200).send({ msg: 'Email verified successfully! You can now login.' });
        }
    );
}; 


const logout = async (req, res) => {
    try {
      const token = req.header('Authorization'); 
  console.log(token)
      const sql = `UPDATE users SET token = null;`;
      db.query(sql, [token], (error, results, fields) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'An error occurred while logging out' });
        }
        console.log('Token removed from the database');
      });
  
     return res.status(200).json( {
        "message": "Logout successful...See you soon!"
    })
    } catch (err) {
      console.error(err);
      res.status(500).json(err.stack );
    }
  };


const login = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
 
    const providedPassword = req.body.password;
    const username = req.body.username;

    db.query(
        `SELECT * FROM loginauthentication WHERE username = ?`,
        [username],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).send({ msg: "Database error" });
            }
            if (!result.length) {
                return res.status(401).send({ msg: 'Username or Password is incorrect! Please try again or reset your password.' });
            }

            const storedPassword = result[0].password;

            // Check if provided password matches stored password (whether hashed or plaintext)
            if (providedPassword === storedPassword) {
                handleSuccessfulLogin(req, res, result);
            } else {
                // Passwords don't match
                return res.status(401).send({ msg: 'Username or Password is incorrect! Please try again or reset your password.' });
            }
        }
    );
};




function handleSuccessfulLogin(req, res, result) {
    const username = req.body.username;

    db.query(
        `SELECT user_id FROM login_user WHERE username = ?`,
        [username],
        (lErr, lResult) => {
            if (lErr) {
                console.error("Database error:", lErr);
                return res.status(500).send({ msg: "Database error" });
            }
            if (!lResult.length) {
                return res.status(401).send({ msg: 'User not found in login_user table!' });
            }
            const userId = lResult[0].user_id;

            db.query(
                `SELECT * FROM users WHERE user_id = ?`,
                [userId],
                (uErr, uResult) => {
                    if (uErr) {
                        console.error("Database error:", uErr);
                        return res.status(500).send({ msg: "Database error" });
                    }
                    if (!uResult.length) {
                        return res.status(401).send({ msg: 'User not found in users table!' });
                    }

                    //console.log(uResult[0].loggedout)
                    const token = jwt.sign(
                        { user_id: userId,role:uResult[0].role },
                        JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    db.query(
                        `UPDATE users SET token = ?, loggedout = ?, updated_at = NOW() WHERE user_id = ?`,
                        [token, 'false', userId], // Assuming user is logged in after login
                        (updateErr, updateResult) => {
                            if (updateErr) {
                                console.error("Database error:", updateErr);
                                return res.status(500).send({ msg: "Database error" });
                            }
                            return res.status(200).send({
                                msg: 'You are Logged In',
                                token,
                                //users: uResult[0]
                                
                            });
                           
                        }
                    );
                }
            );
        }
    );
}



const resetPassword = (req, res) => {
    const { password } = req.body; // Get the reset password from the request query parameters

    if ( !password) {
        return res.status(400).send({ msg: 'new password is missing' });
    }

    // Hash the new password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send({ msg: 'Error hashing the password' });
        }

        // Update the password in the database using the reset password token
        db.query(
            'UPDATE loginauthentication SET password = ?',
            [hash, password],
            (err, result) => {
                if (err) {
                    return res.status(500).send({ msg: 'Error updating the password' });
                }

                // Password updated successfully
                return res.status(200).send({ msg: 'Password updated successfully' });
            }
        );
    });
};




module.exports = {
    register,
    verifyEmail,
    login,
    resetPassword,
    logout,
    
    
};