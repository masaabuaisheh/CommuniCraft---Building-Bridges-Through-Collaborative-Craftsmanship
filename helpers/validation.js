const{check}=require('express-validator');
exports.signUpValidation=[
    check('name','Name is required').not().isEmpty(),
    check('email','Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots: true}),
    check('bio','Write a short information about yourself'),
   // check('role','').not().isEmpty(),
    check('location','Locatin is required').not().isEmpty(),
    check('phonenumber','Phonenumber is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty(),
    check('username','Username is required').not().isEmpty(),
    check('password','Password is required').isLength({max:5})

]
exports.loginValidation=[
    check('username','Please enter a valid Username.').not().isEmpty(),
    check('password','Password may maximum 4 length').isLength({max:4})
]