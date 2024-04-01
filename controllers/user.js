const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/dbconnection');
const randomstring = require('randomstring');
const e = require('cors');


const updeteprofileuser=(req,res)=>{
    if(req.user.role != "User"){
        return res.json("you are not user")}
        const id = req.user.user_id;
        const name=req.body.name;
        const email=req.body.email;
        const bio=req.body.bio;
        const location=req.body.location;
        const phonenumber=req.body.phonenumber;
        const skills=req.body.skills;
        db.query(`UPDATE users SET name=?,email=?,bio=?,location=?,phonenumber=?,skills=? WHERE user_id=?`,[name,email,bio,location,phonenumber,skills,id],
        (err, projects) => {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).send({ error: 'Internal server error' });
            }
            
    
                res.status(200).send({ msg: "update Successfully " });
           
               
            
        });
    };

    const getuser = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
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

    
      const getProjectsBySkill = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { skillId } = req.params;
        db.query('SELECT p.* FROM project p INNER JOIN projectskill ps ON p.project_id = ps.project_id WHERE ps.skill_id = ?', [skillId], (error, results) => {
          if (error) throw error;
          res.json(results);
        });
      };

      

      const getProjectDetailsById = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId } = req.params;
        db.query('SELECT * FROM project WHERE project_id = ?', [projectId], (error, results) => {
          if (error) throw error;
          res.json(results[0]);
        });
      };


      const getUserProfileById = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { userId } = req.params;
        db.query('SELECT * FROM users WHERE user_id = ?', [userId], (error, results) => {
          if (error) throw error;
          res.json(results[0]);
        });
      };
      const joinProject = (req, res) => {
        const projectId = req.params.projectId;
    const userId = req.user.user_id; 

    db.beginTransaction(err => {
        if (err) {
            return res.status(500).send({ error: 'Error starting transaction' });
        }
            db.query('SELECT group_size FROM project WHERE project_id = ? AND group_size > 0', [projectId], (err, results) => {
            if (err || results.length === 0) {
                return db.rollback(() => {
                    res.status(500).send({ error: 'Error checking project availability or no space left' });
                });
            }
            const newGroupSize = results[0].group_size - 1;
            db.query('UPDATE project SET group_size = ? WHERE project_id = ?', [newGroupSize, projectId], (err, updateResults) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).send({ error: 'Error updating group size' });
                    });
                }

                db.query('INSERT INTO user_project (project_id, user_id, status) VALUES (?, ?, "Active")', [projectId, userId], (err, insertResults) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).send({ error: 'Error recording user participation' });
                        });
                    }
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).send({ error: 'Error committing transaction' });
                            });
                        }

                        res.send({ message: 'Successfully joined the project', projectId: projectId, userId: userId });
                    });
                });
            });
        });
    });
      };


      const getUserSkillsByUserId = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { userId } = req.params;
        db.query('SELECT skills FROM users WHERE user_id = ?', [userId], (error, results) => {
          if (error) {
            console.error('Error fetching user skills:', error);
            return res.status(500).send('Error fetching user skills');
          }
         
          res.json(results.length > 0 ? results[0].skills.split(',') : []);
        });
      };

      const findPotentialCollaborators = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId } = req.params;
        db.query('SELECT u.* FROM users u INNER JOIN user_project up ON u.user_id = up.user_id INNER JOIN projectskill ps ON up.project_id = ps.project_id WHERE ps.project_id = ? AND FIND_IN_SET(ps.skill_id, u.skills)', [projectId], (error, results) => {
          if (error) throw error;
          res.json(results);
        });
      };

      const getProjectTasksByProjectId = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId } = req.params;
        db.query('SELECT * FROM project_tasks WHERE project_id = ?', [projectId], (error, results) => {
          if (error) throw error;
          res.json(results);
        });
      };
      
      
      const postComment = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user");
        }
    
        const { projectId } = req.params;
        const { commentText } = req.body;
        const userId = req.user.user_id; 
        db.query('SELECT * FROM user_project WHERE user_id = ? AND project_id = ? AND status = "Active"', [userId, projectId], (checkError, checkResults) => {
            if (checkError) {
                console.error('Error checking user project membership:', checkError);
                return res.status(500).send('Error checking project membership');
            }
    
            if (checkResults.length === 0) {
               
                return res.status(403).send('User is not a member of the project');
            }
    
            db.query('INSERT INTO comments (project_id, user_id, comment_text) VALUES (?, ?, ?)', [projectId, userId, commentText], (error, results) => {
                if (error) {
                    console.error('Error adding comment:', error);
                    return res.status(500).send('Error adding comment');
                }
                res.send('Comment added successfully');
            });
        });
    };
    
      
    const getComments = (req, res) => {
      if(req.user.role !== "User") {
        return res.json("You are not a user.");
      }
    
      const { projectId } = req.params;
      const userId = req.user.user_id; 
      db.query('SELECT * FROM user_project WHERE project_id = ? AND user_id = ? AND status = "Active"', [projectId, userId], (error, projectResults) => {
        if (error) {
          console.error('Error checking project association:', error);
          return res.status(500).send('Error checking project association');
        }
        if (projectResults.length === 0) {
          return res.status(403).json({ message: "You are not part of this project." });
        }
        db.query('SELECT c.*, u.name as user_name FROM comments c JOIN users u ON c.user_id = u.user_id WHERE c.project_id = ?', [projectId], (error, commentsResults) => {
          if (error) {
            console.error('Error fetching comments:', error);
            return res.status(500).send('Error fetching comments');
          }
          res.json(commentsResults);
        });
      });
    };
      const getShowcasedProjects = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        console.log("Here");
        db.query('SELECT * FROM project ', (error, results) => {
          if (error) {
            console.error('Error fetching showcased projects:', error);
            return res.status(500).send('Error fetching showcased projects');
          }
         
          res.json(results);
        });
      };
      
      const toggleProjectShowcase = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId } = req.params;
        db.query('UPDATE project SET showcased = NOT showcased WHERE project_id = ?', [projectId], (error, results) => {
          if (error) {
            console.error('Error toggling project showcase status:', error);
            return res.status(500).send('Error toggling project showcase status');
          }
          console.log('Project showcase status toggled successfully');
          res.send('Project showcase status toggled successfully');
        });
      };
      
     
    
    module.exports = {
        updeteprofileuser,
        getuser,
        joinProject,
    getProjectsBySkill,
    getProjectDetailsById,
    getUserProfileById,
    getUserSkillsByUserId,
    findPotentialCollaborators,
    getProjectTasksByProjectId,
    postComment,
    getComments,
    getShowcasedProjects,
    toggleProjectShowcase



    


    }
