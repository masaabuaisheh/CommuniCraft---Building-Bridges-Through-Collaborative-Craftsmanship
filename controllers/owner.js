const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/dbConnection');
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;
const e = require('cors');


const updeteprofileowner=(req,res)=>{
    if(req.user.role != "Owner"){
        return res.json("you are not Owner")}
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

const getowner = (req, res) => {
        if(req.user.role != "Owner"){
            return res.json("you are not Owner")}
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

    
module.exports = {
    updeteprofileowner,
    getowner
}
