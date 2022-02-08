const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Raviisagoodb$oy';

// ROUTE 1: Creating a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res)=>{
    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Check whether the user with this email exists already
    try {
        let user = await User.findOne({email: req.body.email});
        if (user){
            return res.status(400).json({email: 'Sorry! a user with this email already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new User
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        
        //   .then(user => res.json(user))
        //   .catch(err=> {console.log(err)
        // res.json({errpr: 'Please enter a unique value for email', message: err.message})});

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);

        // res.json(user);
        res.json({authtoken});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!");
    }

    // obj = {
    //     a: 'ravi',
    //     number: 11
    // }
    // res.json(obj);

    // console.log(req.body);
    // const user = User(req.body);
    // user.save();
    // res.send("hello");

    // res.send(req.body);
});

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
    // body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res)=>{
    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;

    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "Please try to login with correct credentials."});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "Please try to login with correct credentials."});
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({authToken});

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!");
    }
});

// ROUTE 3: Get loggedin user Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res)=>{

    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!");
    }

});

module.exports = router;