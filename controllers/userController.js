const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/dbconnection');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');


const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 's12027844@stu.najah.edu', 
        pass: 'xpwp xopq tdhm dilu'
    }
});

  
const register = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const verificationToken = randomstring.generate();

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

                    const userId = userResult.insertId; 

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


                                        var mailOptions = {
                                            from: 's12027844@stu.najah.edu',
                                            to: req.body.email,
                                            subject: 'Verify Your Email Address',
                                            text: `Welcome to our platform! Please verify your email address by clicking on the following link: localhost:4400/APIS/verify-email?token=${verificationToken}`
                                          };
                                          
                                          transporter.sendMail(mailOptions, function(error, info){
                                            if (error) {
                                              console.log(error);
                                            } else {
                                              console.log('Email sent: ' + info.response);
                                            }
                                          });

                                        transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                return db.rollback(() => {
                                                    res.status(500).send({ msg: 'Error sending verification email' });
                                                });
                                            }
                                            
                                            db.commit((err) => {
                                                if (err) {
                                                    return db.rollback(() => {
                                                        res.status(500).send({ msg: err });
                                                    });
                                                }
                                                   const verificationMessage = `The user has been registered. Please verify your email using the link sent to your email address.`;
                                                res.status(200).send({ msg: verificationMessage });
                                            });
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
    const { token } = req.query; 

    if (!token) {
        return res.status(400).send({ msg: 'Verification token is missing' });
    }

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
            bcrypt.compare(providedPassword, storedPassword, (err, isMatch) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return res.status(500).send({ msg: "Error comparing passwords" });
                }
                if (isMatch || providedPassword === storedPassword) {
                    db.query(
                        `SELECT user_id FROM login_user WHERE username = ?`,
                        [username],
                        (err, user_idResult) => {
                            if (err) {
                                console.error("Database error:", err);
                                return res.status(500).send({ msg: "Database error" });
                            }
                            if (!user_idResult.length) {
                                return res.status(404).send({ msg: 'user ID  not found.' });
                            }

                            const user_id = user_idResult[0].user_id;
                            db.query(
                                `SELECT messages FROM users WHERE user_id = ?`,
                                [user_id],
                                (err, messagesResult) => {
                                    if (err) {
                                        console.error("Database error:", err);
                                        return res.status(500).send({ msg: "Database error" });
                                    }
                                    const messages = messagesResult[0].messages;
                                    if (messages !== null) {
                                        handleSuccessfulLogin(req, res, result);
                                    } else {
                                        return res.status(401).send({ msg: 'Please verify your email before logging in.' });
                                    }
                                }
                            );
                        }
                    );
                } else {
                    return res.status(401).send({ msg: 'Username or Password is incorrect! Please try again or reset your password.' });
                }
            });
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
                    const token = jwt.sign(
                        { user_id: userId,role:uResult[0].role },
                        JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    db.query(
                        `UPDATE users SET token = ?, loggedout = ?, updated_at = NOW() WHERE user_id = ?`,
                        [token, 'false', userId], 
                        (updateErr, updateResult) => {
                            if (updateErr) {
                                console.error("Database error:", updateErr);
                                return res.status(500).send({ msg: "Database error" });
                            }
                            return res.status(200).send({
                                msg: 'You are Logged In',
                                token,
                               
                            });
                           
                        }
                    );
                }
            );
        }
    );
};


const resetPassword = (req, res) => {z
    const { email,username } = req.body; 

    if (!email) {
        return res.status(400).send({ msg: 'Email is missing' });
    }
    const newPassword = Math.floor(1000 + Math.random() * 9000).toString(); 
    bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
            return res.status(500).send({ msg: 'Error hashing the password' });
        }
        db.query(
            'UPDATE loginauthentication SET password = ? WHERE username = ?',
            [hash, username],
            (err, result) => {
                if (err) {
                    return res.status(500).send({ msg: 'Error updating the password' });
                }
                const mailOptions = {
                    from: 's12027844@stu.najah.edu',
                    to: email,
                    subject: 'Your New Password',
                    text: `Your new password is: ${newPassword}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });

                return res.status(200).send({ msg: 'New password sent successfully' });
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