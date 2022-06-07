const router = require("express").Router();
const { count } = require("../models/Conversation");
const Conversation = require("../models/Conversation");
const Conversaion = require("../models/Conversation")

// new conversation

router.post("/personal/", async (req, res)=>{
    console.log(req.body)
    const newConversation = new Conversaion({
        members: req.body.members,
        isGroup: false,
    });
    
    try{
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    }catch(err){
        res.status(500).json(err);
    }
})

router.post("/group/", async (req, res)=>{
    console.log(req.body)
    const newConversation = new Conversaion({
        members: req.body.members,
        isGroup: true,
        admins: req.body.admins,
        name: req.body.name
    });
    
    try{
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    }catch(err){
        res.status(500).json(err);
    }
})


// get conv

router.get("/:userId", async (req, res)=>{
    try{
        const conversation = await Conversation.find({
            members: { $in:[req.params.userId] },
        });

        res.status(200).json(conversation);

    }catch(err){
        res.status(500).json(err);
    }
})

router.delete("/:id", async (req, res)=>{
    if(req.body.userId === req.body.userId){
        try{
            const conv = await Conversation.findByIdAndDelete({_id: req.params.id});
            res.status(200).json("conversation has been deleted successfully!");
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("You can delete only your account!");
    }
})

//remove member from group    :id = memberid, the member who is going to be removed. userId is the person who is removing the other person

router.post("/remove", async (req,res)=>{
    console.log("removing...");
      const conversation = await Conversation.findById(req.body.conversationId);
      const removemember = await conversation.admins.includes(req.body.userId);
      console.log(conversation)
      if(removemember){
          try{
              console.log("check");
              await conversation.updateOne({$pull: {members: req.body.memberId}})
              res.status(200).json("removed successfully");

          }
        catch(err){
            return res.status(500).json(err);
        }
    }
      else{
          return res.status(403).json("You are not admin of this group.");
      }
})


// leave group   :id = memberid, the person who is leaving the group. userId is for checking if the person who is leaving the group is admin or not.

router.post("/leave", async (req,res)=>{
    const conversation = await Conversation.findById(req.body.conversationId);
    try{
        if(conversation.admins.includes(req.body.userId) === true){
            await conversation.updateOne({$pull: {admins: req.body.userId}})
        }
        
        await conversation.updateOne({$pull: {members: req.body.userId}})
        res.status(200).json("leave successfully");
    }catch(err){
        return res.status(500).json(err);
    }
 
})

//make admin 

router.post("/makeadmin", async (req,res)=>{
    console.log("removing...");
    const conversation = await Conversation.findById(req.body.conversationId);
    const removemember = conversation.admins.includes(req.body.userId);
    if(removemember===true){
        try{
            await conversation.updateOne({$push: {admins: req.body.memberId}});
            res.status(200).json(conversation);

        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("You are not admin of this group.");
    }
})

router.post("/:groupId/desc", async (req, res)=>{
        try{
            const conversation = await User.findByIdAndUpdate(req.body.groupId, {description: req.body.description});
            res.status(200).json(conversation);
        }catch(err){
            res.status(500).json(err)
        }
})


router.post("/:conversationId/count", async (req, res)=>{
    try{
        const conversation = await Conversation.findByIdAndUpdate(req.params.conversationId, {unseenMessageCount: req.body.count});
        await Conversation.findByIdAndUpdate(req.params.conversationId, {sender: req.body.sender});
        res.status(200).json(conversation);
    }catch(err){
        res.status(500).json(err)
    }
})


router.post("/group/:groupId/addmember",async (req,res)=>{
    const group = await Conversation.findById(req.body.conversationId);
    const isAdmin = group.admins.includes(req.body.userId);
    console.log('addding', [...group.members, ...req.body.members], req.body.conversationId)
    if(isAdmin){
          try{
            const grp = await Conversation.findByIdAndUpdate(req.body.conversationId, {members: [...group.members, ...req.body.members]});
            res.status(200).json(group);
          }catch(err){
            res.status(500).json(err);
          }
    }
    else{
        res.status(403).json("You are not admin of this group.");
    }
})

router.post("/:conversationId/name", async (req, res)=>{
    const conversation = await Conversation.findById(req.params.conversationId);
    if(conversation?.admins.includes(req.body.userId) === true){
        try{
            const conv = await Conversaion.findByIdAndUpdate(req.params.conversationId, {name: req.body.name});
            res.status(200).json(conv);
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you don't have access");
    }
})


module.exports = router