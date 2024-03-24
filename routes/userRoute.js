const express=require("express");
const router=express.Router();
const{signUpValidation , loginValidation}=require('../helpers/validation');
const userController=require('../controllers/userController');
const admin = require('../controllers/admin'); 
const user = require('../controllers/user'); 
const owner = require('../controllers/owner'); 

const material = require('../controllers/material'); 
const getMaterialsByUserId = require('../controllers/material');
const deleteYourMaterial = require('../controllers/material');
const { authenticateJWT } = require("../middleware/middlware");
router.post('/register',signUpValidation,userController.register);
router.post('/login', userController.login);
// Route for verifying user email
router.get('/verify-email',loginValidation, userController.verifyEmail);
//extracting useful information from the token, like who the user is
router.post('/reset-password',loginValidation, userController.resetPassword);
router.post('/logout',userController.logout);

router.get('/showallprojects',authenticateJWT,admin.showallprojects);
router.get('/showalluser',authenticateJWT,admin.showalluser);
router.delete('/deleteuser/:id',authenticateJWT,admin.deleteuser);
router.put('/updeteprofile/:id',authenticateJWT,admin.updeteprofile);
router.post('/addOwner',authenticateJWT,admin.addOwner);
router.get('/searchuser/:id',authenticateJWT,admin.searchuser);
router.get('/searchproject/:id',authenticateJWT,admin.searchproject);
router.put('/updeteprofileuser',authenticateJWT,user.updeteprofileuser);
router.put('/updeteprofileowner',authenticateJWT,owner.updeteprofileowner);
router.get('/getowner',authenticateJWT,owner.getowner);
router.get('/getadmin',authenticateJWT,admin.getadmin);
router.get('/getuser',authenticateJWT,user.getuser);
router.post('/addMaterial',authenticateJWT,material.addMaterial);
router.get('/getYourMaterial',authenticateJWT,getMaterialsByUserId.getYourMaterial );
router.put('/deleteYourMaterial', authenticateJWT, deleteYourMaterial.deleteYourMaterial);
router.get('/showAllVariableMaterials', authenticateJWT, material.showavailablematerial);
router.post('/buyMaterial', authenticateJWT, material.buyMaterial);
////////////////////////////////////////////////////////////////////////////
router.get('/projects/skill/:skillId',authenticateJWT, user.getProjectsBySkill);
router.get('/projects/groupsize/:groupSize',authenticateJWT, owner.getProjectsByGroupSize);
router.get('/projects/:projectId',authenticateJWT, user.getProjectDetailsById);
router.get('/projects/showcased',authenticateJWT, user.getShowcasedProjects);
router.get('/projects/:projectId/comments',authenticateJWT, user.getComments);
router.get('/projects/:projectId/tasks',authenticateJWT, user.getProjectTasksByProjectId);

// User Routes
router.get('/users/:userId',authenticateJWT, user.getUserProfileById);
router.get('/users/:userId/skills',authenticateJWT, user.getUserSkillsByUserId);

// Collaboration Routes
router.get('/collaborators/:projectId',authenticateJWT, user.findPotentialCollaborators);

// Task and Comment Management
router.post('/projects/:projectId/tasks', authenticateJWT,owner.addNewTaskToProject);
router.post('/projects/:projectId/comments',authenticateJWT, user.postComment);

// Project Administration
router.put('/projects/:projectId/toggleShowcase',authenticateJWT, user.toggleProjectShowcase);
router.put('/projects/:projectId/tasks/:taskId', authenticateJWT,owner.updateProjectTask);
// 
router.post('/joinProject/:projectId',authenticateJWT,user.joinProject);

router.post('/chat',openai.chatGPT);
module.exports=router;