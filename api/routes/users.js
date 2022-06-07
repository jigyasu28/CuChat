const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const multer = require("multer");
const path = require("path")

const DIR = './images';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + file.originalname;
        cb(null, fileName.replace(/\s/g, ''))
    }
});
var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});


// update user
router.put("/:id", async (req, res)=>{
    if(req.body.userId == req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }catch(err){
                return res.status(500).json(err);
            }
        }

        try{
            const user = await User.findByIdAndUpdate(req.params.id,{
                $set:req.body
            });

            res.status(200).json("account has been updated");
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("You can update only your account!");
    }
})


// deleteuser
router.delete("/:id", async (req, res)=>{
    if(req.body.userId == req.params.id || req.body.isAdmin){
        try{
            const user = await User.findByIdAndDelete({_id: req.params.id});
            res.status(200).json("account has been deleted successfully!");
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("You can delete only your account!");
    }
})


// get a user

router.get("/uid/:uid", async (req, res)=>{
    try{
        const user = await User.find({uid: req.params.uid});
        if(user.length === 0){
            throw "not found";
        }
        res.status(200).json(user[0]);
    }catch(err){
        return res.status(500).json(err)
    }
})

router.get("/:id", async (req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        const { password, updatedAt, ...other } = user._doc
        res.status(200).json(other);
    }catch(err){
        return res.status(500).json(err)
    }
})

// follow a user

router.put("/:id/sendrequest", async (req, res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(!user.requestsReceived.includes(req.body.userId)){
                await currentUser.updateOne({$push: {requestsSent: req.params.id}})
                await user.updateOne({$push: {requestsReceived: req.body.userId}})
                res.status(200).json("friend request sent")
            }else{
                res.status(403).json("you already follow this user");
            }

        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can't follow yourself");
    }
})

router.put("/:id/acceptrequest", async (req, res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(currentUser.requestsReceived.includes(user._id)){
                await user.updateOne({$pull: {requestsSent: req.body.userId}})
                await user.updateOne({$push: {friends: req.body.userId}})
                await currentUser.updateOne({$pull: {requestsReceived: req.params.id}})
                await currentUser.updateOne({$push: {friends: req.params.id}})

                res.status(200).json("friend request sent")
            }else{
                res.status(403).json("you already follow this user");
            }

        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can't follow yourself");
    }
})

router.put("/:id/rejectrequest", async (req, res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            
            if(currentUser.requestsReceived.includes(user._id)){
                console.log("here")
                await user.updateOne({$pull: {requestsSent: req.body.userId}})
                await currentUser.updateOne({$pull: {requestsReceived: req.params.id}})

                console.log("here")
                res.status(200).json("request rejected")
            }else{
                res.status(403).json("you don' thave request from this user");
            }

        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can't reject your own request");
    }
})

// unfollow

router.put("/:id/unfollow", async (req, res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);


            if(user.friends.includes(req.body.userId)){
                await user.updateOne({$pull: {friends: req.body.userId}})
                await currentUser.updateOne({$pull: {friends: req.params.id}})

                res.status(200).json("user has been unfollowed")
            }else{
                res.status(403).json("you don't follow this user");
            }

        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can't unfollow yourself");
    }
})

// getfriends

router.get("/friends/:userId", async(req, res)=>{
    try{
        const user = await User.findById(req.params.userId);

        const friends = await Promise.all(
            user.friends.map(friendId => {
                return User.findById(friendId);
            })
        )
        

        let friendList = [];
        friends.map(friend=>{
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture})
        })
        res.status(200).json(friendList)

    }catch(err){
        res.status(500).json(err);
    }
})

router.post("/:userId/profile",  upload.single('image'), async (req, res)=>{
    if(req.body.userId === req.params.userId){
        try{
            console.log(req.file)
            const user = await User.findByIdAndUpdate(req.body.userId, {profilePicture: req.file.filename});
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can't change other's profile");
    }
})

router.post("/:userId/desc", async (req, res)=>{
    if(req.body.userId === req.params.userId){
        try{
            const user = await User.findByIdAndUpdate(req.body.userId, {desc: req.body.description});
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can't change other's profile");
    }
})

router.post("/:userId/username", async (req, res)=>{
    if(req.body.userId === req.params.userId){
        try{
            const user = await User.findByIdAndUpdate(req.body.userId, {username: req.body.username});
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can't change other's profile");
    }
})


module.exports = router