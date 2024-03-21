const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/dbconnection');
const randomstring = require('randomstring');
const e = require('cors');
///main
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

    const getProjects = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        db.query('SELECT * FROM project', (error, results) => {
          if (error) throw error;
          res.json(results);
        });
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
      
      const getProjectsByGroupSize = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { groupSize } = req.params;
        db.query('SELECT * FROM project WHERE group_size >= ?', [groupSize], (error, results) => {
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
      
      const addNewTaskToProject = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId } = req.params;
        const { taskName, assignedTo } = req.body;
        db.query('INSERT INTO project_tasks (task_name, project_id, assigned_to) VALUES (?, ?, ?)', [taskName, projectId, assignedTo], (error, results) => {
          if (error) throw error;
          res.send('Task added successfully');
        });
      };
      
      const postComment = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId } = req.params;
        const { commentText, userId } = req.body;
        db.query('INSERT INTO comments (project_id, user_id, comment_text) VALUES (?, ?, ?)', [projectId, userId, commentText], (error, results) => {
          if (error) throw error;
          res.send('Comment added successfully');
        });
      };
      
      const getComments = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId } = req.params;
        db.query('SELECT c.*, u.name as user_name FROM comments c JOIN users u ON c.user_id = u.user_id WHERE c.project_id = ?', [projectId], (error, results) => {
          if (error) throw error;
          res.json(results);
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
      
      const updateProjectTask = (req, res) => {
        if(req.user.role != "User"){
            return res.json("you are not user")}
        const { projectId, taskId } = req.params;
        const { taskName, assignedTo } = req.body;
      
        db.query('UPDATE project_tasks SET task_name = ?, assigned_to = ? WHERE project_id = ? AND task_id = ?', [taskName, assignedTo, projectId, taskId], (error, results) => {
          if (error) {
            console.error('Error updating project task:', error);
            return res.status(500).send('Error updating project task');
          }
          res.send('Task updated successfully');
        });
      };
      
      
      
     
    
    module.exports = {
        updeteprofileuser,
        getuser,
        getProjects,
        getProjectsBySkill,
        getProjectsByGroupSize,
        getProjectDetailsById,
        getUserProfileById,
        getUserSkillsByUserId,
        findPotentialCollaborators,
        getProjectTasksByProjectId,
        addNewTaskToProject,
        postComment,
        getComments,
        getShowcasedProjects,
        toggleProjectShowcase,
        updateProjectTask


    }
