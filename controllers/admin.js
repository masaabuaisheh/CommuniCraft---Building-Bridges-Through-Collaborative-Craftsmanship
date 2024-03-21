const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/dbconnection');
const randomstring = require('randomstring');

const showallprojects = (req, res) => {
   
    if(req.user.role != "Admin"){
        return res.json("you are not admin")
    }
    
    db.query('SELECT * FROM project ', (err, projects) => {
        if (err) {
            console.error('Error fetching projects:', err);
            return res.status(500).send({ error: 'Internal server error' });
        }
        

            res.status(200).send({ projects });
       
           
        
    });
}

const showalluser=(req,res)=>{
        if(req.user.role != "Admin"){
            return res.json("you are not admin or you are loggedout")}
            

            
            try{
                db.query('SELECT * FROM users ', (err, users) => {
                    if (err) {
                        console.error('Error fetching users:', err);
                        return res.status(500).send({ error: 'Internal server error' });
                    }
                    
        
                    return    res.status(200).json({ users });
                    
                } );
            }catch(err){
                return res.json(err.stack)
            }
            
           
             

  
    
    
     

}

const deleteuser = async (req, res) => {
        if (req.user.role !== "Admin") {
            return res.json("You are not admin");
        }
    
        const id = req.params.id; // Corrected property name to req.params.id
    
        try {
            // Delete from user_project table
            await deleteFromTable('user_project', 'user_id', id);
    
            // Fetch username from login_user table
            const rows = await selectFromTable('login_user', 'username', 'user_id', id);
            if (rows.length === 0) {
                throw new Error('Username not found');
            }
            const username = rows[0].username;
    
            // Delete from login_user table
            await deleteFromTable('login_user', 'user_id', id);
    
            // Delete from loginauthentication table
            await deleteFromTable('loginauthentication', 'username', username);
    
            // Delete from users table
            await deleteFromTable('users', 'user_id', id);
    
            res.status(200).send({ msg: 'Deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
};
    
   
const deleteFromTable = (tableName, key, value) => {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM ${tableName} WHERE ${key}=? `, [value], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
};
    
const selectFromTable = (tableName, columns, key, value) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT ${columns} FROM ${tableName} WHERE ${key}=? `, [value], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
};

const updeteprofile=(req,res)=>{
        if(req.user.role != "Admin"){
            return res.json("you are not admin")}
            const id = req.params.id;
            const name=req.body.name;
            const email=req.body.email;
            const bio=req.body.bio;
            const location=req.body.location;
            const phonenumber=req.body.phonenumber;
            const skills=req.body.skills;
            db.query(`UPDATE users SET name=?,email=?,bio=?,location=?,phonenumber=?,skills=? WHERE user_id=? `,[name,email,bio,location,phonenumber,skills,id],
            (err, projects) => {
                if (err) {
                    console.error('Error fetching users:', err);
                    return res.status(500).send({ error: 'Internal server error' });
                }
                
        
                    res.status(200).send({ msg: "update Successfully " });
               
                   
                
            });




    

};
    
const addOwner=(req,res)=>{
        if (req.user.role !== "Admin") {
            return res.json("You are not admin");
        }
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
                VALUES (?, ?, ?, 'Owner', ?, ?, ?, ?,'False')`,
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

const searchuser=(req,res)=>{
        if(req.user.role != "Admin"){
            return res.json("you are not admin")}
            const id = req.params.id;

            db.query('SELECT * FROM users WHERE user_id=?',id,(err, users) => {
                if (err) {
                    console.error('Error fetching users:', err);
                    return res.status(500).send({ error: 'Internal server error' });
                }
                
    
                    res.status(200).send({ users });
               
                   
                
            });
    
};

const searchproject=(req,res)=>{
        if(req.user.role != "Admin"){
            return res.json("you are not admin")}
            const id = req.params.id;

            db.query('SELECT * FROM project WHERE project_id=?',id,(err, project) => {
                if (err) {
                    console.error('Error fetching users:', err);
                    return res.status(500).send({ error: 'Internal server error' });
                }
                
    
                    res.status(200).send({ project });
               
                   
                
            });
    
};

const getadmin = (req, res) => {
        if(req.user.role != "Admin"){
            return res.json("you are not Admin")}
            const id = req.user.user_id;
        db.query(
            `SELECT * FROM users WHERE user_id = ? AND loggedout = 'false'`, id, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ success: false, message: 'Internal server error.' });
                }
    
                if (!result.length) {
                    return res.status(401).send({ success: false, message: 'No user found or user is logged out.' });
                }
    
                return res.status(200).send({ success: true, data: result[0], message: 'User found.' });
            }
        );
};

const addproject = (req, res) => {
        if (req.user.role !== "Admin") {
            return res.json("You are not an admin");
        }
    
        const { title, description, group_size, showcased, skill_name } = req.body;
        console.log(req.body);
    
        // Check if showcased property is provided, if not, set a default value or handle it as per your requirement
        const showcasedValue = showcased !== undefined ? showcased : null;
    
        // Begin transaction
        db.beginTransaction(err => {
            if (err) {
                console.error('Error beginning transaction:', err);
                return res.status(500).json({ success: false, error: 'Transaction begin error' });
            }
    
            // Check if skill_name exists in craftskill table
            db.query(
                'SELECT skill_id FROM craftskill WHERE skill_name = ?',
                [skill_name],
                (err, craftSkillResult) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error checking craft skill:', err);
                            return res.status(500).json({ success: false, error: 'Error checking craft skill' });
                        });
                    }
    
                    let skillId;
                    if (craftSkillResult.length > 0) {
                        // Skill name exists in craftskill table, get the skill_id
                        skillId = craftSkillResult[0].skill_id;
                        // Proceed to insert into projectskill table
                        insertIntoProjectSkill(skillId);
                    } else {
                        // Skill name doesn't exist in craftskill table, insert it
                        db.query(
                            'INSERT INTO craftskill (skill_name) VALUES (?)',
                            [skill_name],
                            (err, insertCraftSkillResult) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error('Error inserting craft skill:', err);
                                        return res.status(500).json({ success: false, error: 'Error inserting craft skill' });
                                    });
                                }
                                // Get the inserted skill_id
                                skillId = insertCraftSkillResult.insertId;
                                // Proceed to insert into projectskill table
                                insertIntoProjectSkill(skillId);
                            }
                        );
                    }
                }
            );
    
            function insertIntoProjectSkill(skillId) {
                // Insert project details
                db.query(
                    'INSERT INTO project (title, description, group_size, showcased) VALUES (?, ?, ?, ?)',
                    [title, description, group_size, showcasedValue],
                    (err, projectResult) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error inserting project:', err);
                                return res.status(500).json({ success: false, error: 'Error adding project' });
                            });
                        }
    
                        const projectId = projectResult.insertId; // Get the auto-incremented project ID
    
                        // Insert into projectskill table
                        db.query(
                            'INSERT INTO projectskill (project_id, skill_id) VALUES (?, ?)',
                            [projectId, skillId],
                            (err, projectSkillResult) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error('Error inserting project skill:', err);
                                        return res.status(500).json({ success: false, error: 'Error adding project skill' });
                                    });
                                }
    
                                // Commit transaction
                                db.commit(err => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error('Error committing transaction:', err);
                                            return res.status(500).json({ success: false, error: 'Transaction commit error' });
                                        });
                                    }
    
                                    return res.status(201).json({ success: true, message: 'Project added successfully' });
                                });
                            }
                        );
                    }
                );
            }
        });
};
        
module.exports = {
    showallprojects,
    showalluser,
    deleteuser,
    updeteprofile,
    addOwner,
    searchuser,
    getadmin,
    searchproject,
    addproject

};
