const router = require("express").Router();
const User = require("../models/User")
const bcrypt = require("bcrypt");


router.get("/", (req,res)=>{
    res.send("Hey its auth route")
})

//REGISTER
router.post("/register", async (req, res)=>{
    try{
        // generate new password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword =await bcrypt.hash(req.body.password, salt);

        // create new user
        const alreadyExist = await User.findOne({uid: req.body.uid});
        if(alreadyExist){
            return res.status(403).json("UID already exists");
        }
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            uid: req.body.uid,
            password: hashedPassword,
        });

        // save user and respond
        const user = await newUser.save();
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }

})

// login
router.post("/login", async (req, res)=>{
    try{
        const user = await User.findOne({email: req.body.email});

        if(!user){
            res.status(404).json("user not found");
            return
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword){
            res.status(404).json("wrong password")
        }else{
            res.status(200).json(user);
        }

    }catch(err){
        res.status(500).json(err);
    }
})

module.exports = router