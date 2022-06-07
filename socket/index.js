var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require("socket.io")(server, {
        cors:{
            origin: "https://cuchatapp.herokuapp.com",
        },
    })

server.listen(process.env.PORT || 8900);

let users = [];

const addUser = (userId, socketId)=>{
    userId&& socketId && !users.some(user=> user.userId == userId) && users.push({userId, socketId});
}

const removeUser = (socketId) =>{
    users = users.filter(user=> user.socketId !== socketId)
}

const getUser = (userId) =>{
    return users.find(user=> user.userId === userId);
}

io.sockets.on("connection", (socket) => {
    // when connect
    console.log("a user connected");
    
    // take userIs and socketId from user
    socket.on("addUser", userId=>{
        addUser(userId, socket.id);
        console.log(users);
        io.emit("getUsers", users);
    })

    // send a message
    socket.on("sendMessage", ({senderId, receiverId, message})=>{
        const user = getUser(receiverId);
        if(user !== null || user !== undefined){
            user && io.to(user.socketId).emit("getMessage", {
                senderId,
                message,
            })
        }
    })

    socket.on("sendGroupMessage", ({senderId, receiverArray, message})=>{
        for(let indx in receiverArray){
            let receiverId = receiverArray[indx];
            const user = getUser(receiverId);
            console.log(user);
            if(user !== null || user !== undefined){
                user && io.to(user.socketId).emit("getMessage", {
                    senderId,
                    message,
                })
            }
        }

    })

    socket.on("sendConversation", ({senderId, receiverId, conversation})=>{
        const user = getUser(receiverId);
        
        if(user !== null || user !== undefined){
            user && io.to(user.socketId).emit("addConversation", {
                senderId: senderId,
                receiverId: receiverId,
                conversation: conversation
            })
        }
    })

    socket.on("sendGroupConversation", ({senderId, receiverArray, conversation})=>{
        for(let indx in receiverArray){
            let receiverId = receiverArray[indx];
            const user = getUser(receiverId);
            if(user !== null || user !== undefined){
                user && io.to(user.socketId).emit("getGroupConversation", {
                    senderId: senderId,
                    receiverId: receiverId,
                    conversation: conversation,
                })
            }
        }
    })

    socket.on("deleteConversation", ({senderId, receiverId, conversationId})=>{
        const user = getUser(receiverId);
        console.log(senderId, receiverId, conversationId, "conv delete");
        if(user !== null || user !== undefined){
            user && io.to(user.socketId).emit("deleteConversation", {
                senderId: senderId,
                receiverId: receiverId,
                conversationId: conversationId
            })
        }
    })

    socket.on("deleteGroupConversation", ({senderId, receiverArray, conversationId})=>{
        for(let indx in receiverArray){
            let receiverId = receiverArray[indx];
            const user = getUser(receiverId);
            
            if(user !== null || user !== undefined){
                user && io.to(user.socketId).emit("deleteGroup", {
                    senderId: senderId,
                    receiverId: receiverId,
                    conversationId: conversationId
                })
            }
        }
    })

    socket.on("typing", ({senderId, receiverId, conversationId, status})=>{
        const user = getUser(receiverId);
        if(user !== null || user !== undefined){
            user && io.to(user.socketId).emit("typing", {
                senderId: senderId,
                receiverId: receiverId,
                conversationId: conversationId,
                status: status
            })
        }
    })

    socket.on("grouptyping", ({senderId, receiverArray, conversationId, status})=>{
        for(let indx in receiverArray){
            let receiverId = receiverArray[indx];
            const user = getUser(receiverId);
            if(user !== null || user !== undefined){
                user && io.to(user.socketId).emit("typing", {
                    senderId: senderId,
                    receiverId: receiverId,
                    conversationId: conversationId,
                    status: status
                })
            }
        }

        console.log("sending message", senderId, receiverArray)
    })

    socket.on("removeMember", ({userId, memberId, conversationId})=>{
        const user = getUser(memberId);
        if(user !== null || user !== undefined){
            user && io.to(user.socketId).emit("removeMember", {
                userId: userId,
                memberId: memberId,
                conversationId: conversationId,
            })
        }
    })

    socket.on("leaveMember", ({userId, conversationId, receiverArray})=>{
        for(let indx in receiverArray){
            let receiverId = receiverArray[indx];
            const user = getUser(receiverId);
            if(user !== null || user !== undefined){
                console.log("leaqving message to ")
                user && io.to(user.socketId).emit("leaveMember", {
                    userId: userId,
                    conversationId: conversationId,
                })
            }
        }
    })

    socket.on("makeAdmin", ({userId, receiverArray, conversationId, memberId})=>{
        for(let indx in receiverArray){
            let receiverId = receiverArray[indx];
            const user = getUser(receiverId);

            if(user !== null || user !== undefined){
                user && io.to(user.socketId).emit("makeAdmin", {
                    userId: userId,
                    memberId: memberId,
                    conversationId: conversationId,
                })
            }
        }

    })

    socket.on("sendRequest", ({senderId, receiverId})=>{
        const user = getUser(receiverId);
        console.log("got send request")
        
        if(user !== null || user !== undefined){
            user && io.to(user.socketId).emit("getRequest", {
                senderId,
            })
        }
    })

    socket.on("sendRejection", ({senderId, receiverId})=>{
        const user = getUser(receiverId);
        
        if(user !== null || user !== undefined){
            user && io.to(user.socketId).emit("removeRequestSent", {
                senderId,
            })
        }
    })

    // when disconnect
    socket.on("disconnect", ()=>{
        console.log("a use disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
})