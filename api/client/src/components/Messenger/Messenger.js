import React, { useEffect, useRef } from 'react'
import Picker from "emoji-picker-react";
import { useState } from 'react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import "./messenger.css"
import { axiosInstance } from '../../config';
import ProfileBar from '../ProfileBar/ProfileBar';
import GroupBar from '../GroupBar/GroupBar';
import { CircularProgress, LinearProgress } from '@mui/material';


export default function Messenger({currentConversation,setCurrentConversation ,currentUser, socket, isOnline, unseenMessages, setUnseenMessages, conversation, setConversation, friends, setFriends, typingUser, setTypingUser}) {
  const [user, setUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [pickerVisible, togglePicker] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [text, setText] = useState("");
  const scrollRef = useRef();
  const [isOpen, setIsopen] = useState(false);
  const [members, setMembers] = useState([]);

  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect( async ()=>{
    if(currentConversation?.isGroup === true && members.length === 0){
      try{
          for(let indx in currentConversation.members){
            const res = await axiosInstance.get("/users/" + currentConversation.members[indx]);
            setMembers(prev=> [...prev, res.data])
          }
      }catch(err){
          console.log(err)
      }

      return ()=>{
        setMembers([]);
      }
    }
  }, [currentConversation])

  useEffect(()=>{
    socket.current?.on("removeMember", data=>{
      setCurrentConversation(prev =>{
        if(prev?._id !== data.conversationId){
          return prev;
        }else{
          return null;
        }
      });

      setConversation(prev => prev.filter(c => c._id !== data.conversationId))
    });

    socket.current?.on("leaveMember", data=>{
      console.log("leave")
      setCurrentConversation(prev =>{
        if(prev?._id === data.conversationId){
          prev.members = prev.members.filter(m => m!==data.userId)
          return prev;
        }else{
          return prev;
        }
      });

      setConversation(prev => {
          let temp = prev.filter(c => c._id === data.conversationId)[0];
          temp.members = temp.members.filter(m => m!==data.userId);
          return [...prev.filter(c => c._id !== data.conversationId), temp];
      })
    });

    socket.current?.on("makeAdmin", data=>{
      setConversation(prev =>{
        let temp = prev.filter(c => c._id === data.conversationId)[0]
        temp.admins = [...temp.admins, data.memberId]
        return [...prev.filter(c => c._id !== data.conversationId), temp]
      })
    });

    socket.current?.on("typing", data=>{
      setTypingUser({
        userId: data.senderId,
        conversationId: data.conversationId,
        status: data.status
      });
    });

    socket.current?.on("getMessage", data=>{
      setArrivalMessage({
        sender: data.message.sender,
        text: data.message.text,
        createdAt: data.message.createdAt,
        conversationId: data.message.conversationId
      });
    });

    socket.current?.on("deleteConversation", data=>{
      setConversation(prev => prev.filter(c=> c._id !== data.conversationId))
      setCurrentConversation(prev=>{
        if(prev._id === data.conversationId){
          return null;
        }else{
          return prev;
        }
      })
      setFriends(friends.filter(f => f !== data.senderId))
    });
  }, [socket.current])

  socket.current?.on("deleteGroup", data=>{
    setConversation(prev => prev.filter(c=> c._id !== data.conversationId))
    setCurrentConversation(prev=>{
      if(prev !== null && prev._id === data.conversationId){
        return null;
      }else{
        return prev;
      }
    })
}, [socket.current])


  useEffect(()=>{
    if(arrivalMessage !== null){
      if(arrivalMessage.conversationId === currentConversation?._id){
        setMessages([...messages, arrivalMessage])
        setArrivalMessage(null);
      }
      else{
        if(arrivalMessage.conversationId in unseenMessages){
          let unseenMessagetemp = unseenMessages
          unseenMessagetemp[arrivalMessage.conversationId] += 1
          setUnseenMessages(unseenMessagetemp);

        }else{
          let unseenMessagetemp = unseenMessages
          unseenMessagetemp[arrivalMessage.conversationId] = 1
          setUnseenMessages(unseenMessagetemp);
        }
      }
    }
    
  }, [arrivalMessage])


  useEffect(()=>{
    setLoadingMessages(true);
    if(currentConversation?.length !== 0){
      const friendId = currentConversation?.members.find(m => m !== currentUser._id);
      const getUser = async ()=> {
        try{
          const res = await axiosInstance.get("/users/" + friendId);
          setUser(res.data);
        }catch(err){
          console.log(err);
        }
      }
      getUser();
  }
  setLoadingMessages(false);
  }, [currentConversation, currentUser])

  useEffect(()=>{
    if(currentConversation?.length !== 0){
      const getMessages = async ()=>{
        try{
          setLoadingMessages(true);
          const res = await axiosInstance.get("/messages/" + currentConversation?._id);
          setMessages(res.data);
        }catch(err){
          console.log(err);
        }finally{
          setLoadingMessages(false);
        }
      }

      getMessages();
    }
  }, [currentConversation, currentUser])


  const handleSubmit = async (e) =>{
    e.preventDefault();
    setText("");
    const message = {
      sender: currentUser._id,
      text: newMessage,
      conversationId: currentConversation._id,
      createdAt: Date.now()
    }

    if(currentConversation.isGroup === true){
      socket.current?.emit("sendGroupMessage", {
        senderId: currentUser._id,
        receiverArray: currentConversation.members,
        message: message
      });
    }else{
      socket.current?.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: user._id,
        message: message
      });
    }

    try{
      const res = await axiosInstance.post("/messages", message);
      setMessages([...messages, message]);
    }catch(err){
      console.log(err);
    }finally{
      setNewMessage('')
    }

  }
  
  const handleTextBox = (e) =>{
    setText(e.target.value);
    setNewMessage(e.target.value);

    if(currentConversation.isGroup === false){
      socket.current?.emit("typing", {
        senderId: currentUser._id,
        receiverId: user._id,
        conversationId: currentConversation._id,
        status: true
      });
    }else{
      socket.current?.emit("grouptyping", {
        senderId: currentUser._id,
        receiverArray: currentConversation.members,
        conversationId: currentConversation._id,
        status: true
      });
    }

    setTimeout(() => {
      if(currentConversation.isGroup === false){
        socket.current?.emit("typing", {
          senderId: currentUser._id,
          receiverId: user._id,
          conversationId: currentConversation._id,
          status: false
        });
      }else{
        socket.current?.emit("grouptyping", {
          senderId: currentUser._id,
          receiverArray: currentConversation.members,
          conversationId: currentConversation._id,
          status: false
        });
      }
    }, 1000);
  }
  
  useEffect(()=>{
    scrollRef.current?.scrollIntoView({behaviour: "smooth"});
  }, [messages])

  if(currentConversation === null || currentConversation.length === 0){
    return(
      <div className='messenger-container'>
        <div className='noChat'>
          <h1 className='nochat-message'>Open a conversation to start chatting</h1>
        </div>
      </div>
    );
  }

  const ToggleSidebar = () => {
    isOpen === true ? setIsopen(false) : setIsopen(true);
  }

  if(currentConversation.isGroup === true){
    return (
      <>
        <GroupBar 
          isOpen={isOpen} 
          setIsopen={setIsopen} 
          ToggleSidebar={ToggleSidebar} 
          user={user} me={false} 
          currentUser={currentUser} 
          conversation={conversation} 
          setConversation={setConversation}
          currentConversation={currentConversation}
          setCurrentConversation={setCurrentConversation}
          socket={socket}
          friends={friends}
          setFriends={setFriends}
        />
        <div className="messenger-container">
    
          <div className='messenger-profile-header'>
            <div className='messenger-profile-info'>
            <img src={"/images/" + (currentConversation.groupPicture ? currentConversation.groupPicture : "default.jpg")} className='profile-image'></img>
              <div className='contact-info'>
              Group name : <br></br>
              <h2 className='group-name title-text' onClick={ToggleSidebar}>
                {currentConversation.name}
              </h2>
              </div>
            </div>
          </div>
    
          { loadingMessages ?
            <div className='message-container'>
              <LinearProgress className='loading-chat-progress' size={'10vh'}/>
            </div>
            :
            <>
            <div className='message-container'>
                {
                messages.map((m)=>(
                  <div ref={scrollRef} key={m._id}>
                  <Message key={m._id} text={m.text} time={m.createdAt} sent={m.sender===currentUser._id} senderId={m.sender} members={members} group={currentConversation.isGroup} />
                  </div>
                ))
                }
              </div>
              <div className='chat-box'>
              <div className='search-box'>
                <div className='search-container'>
                  {pickerVisible && <Picker
                      pickerStyle={{ position: "absolute", bottom: "60px" }}
                      onEmojiClick={(e, emoji)=>{
                        setText(prev => prev + emoji.emoji)
                        setNewMessage(prev => prev + emoji.emoji);
                      }}
                    />}
                    <InsertEmoticonIcon className='emoji-image' onClick={() => togglePicker((pickerVisible) => !pickerVisible)}/>
                    <textarea 
                      className='search-input'
                      placeholder='Type a message'
                      value={text}
                      onChange={handleTextBox}
                      ></textarea>
                      <button onClick={handleSubmit} className="searchButton">Send</button>
                </div>
              </div>
            </div>
            </>
            }
        </div>
      </>
      )
  }

  return (
  <>
    <ProfileBar 
      isOpen={isOpen} 
      setIsopen={setIsopen} 
      ToggleSidebar={ToggleSidebar} 
      user={user} me={false} 
      currentUser={currentUser} 
      conversation={conversation} 
      setConversation={setConversation}
      currentConversation={currentConversation}
      setCurrentConversation={setCurrentConversation}
      socket={socket}
      friends={friends}
      setFriends={setFriends}
    />
    <div className="messenger-container">

      <div className='messenger-profile-header'>
        <div className='messenger-profile-info'>
        <img src={"/images/" + user.profilePicture} className='profile-image'></img>
          <div className='contact-info'>
          <h2 className='contact-name title-text' onClick={ToggleSidebar}>
            {user.username}
          </h2>
          { typingUser.status && typingUser.conversationId === currentConversation?._id ? <small className='message-text green-text'><b>Typing...</b></small>:
          isOnline ? <div><span className="online"></span>Online</div> : <div><span className="offline"></span>Offline</div>
          }
          </div>
        </div>
      </div>
      
      { loadingMessages ?
      <div className='message-container'>
        <LinearProgress className='loading-chat-progress' size={'10vh'}/>
      </div>
      :
      <>
      <div className='message-container'>
          {
          messages.map((m)=>(
            <div ref={scrollRef} key={m._id}>
            <Message key={m._id} text={m.text} time={m.createdAt} sent={m.sender===currentUser._id} senderId={m.sender} members={members} />
            </div>
          ))
          }
        </div>
        <div className='chat-box'>
        <div className='search-box'>
          <div className='search-container'>
            {pickerVisible && <Picker
                  pickerStyle={{ position: "absolute", bottom: "60px" }}
                  onEmojiClick={(e, emoji)=>{
                    setText(prev => prev + emoji.emoji);
                    setNewMessage(prev => prev + emoji.emoji);
                  }}
              />}
              <InsertEmoticonIcon className='emoji-image' onClick={() => togglePicker((pickerVisible) => !pickerVisible)}/>
              <textarea 
                className='search-input'
                placeholder='Type a message'
                value={text}
                onChange={handleTextBox}
                ></textarea>
                <button onClick={handleSubmit} className="searchButton">Send</button>
          </div>
        </div>
      </div>
      </>
      }
    </div>
  </>
  )
}


const Message =({text, sent, time, senderId, members, group})=>{
  let [sender, setSender] = useState(null);

  const formatTime=(time)=>{
    return new Date(time).toLocaleTimeString()
  }

  useEffect(()=>{
    setSender(members.filter(m => m._id === senderId)[0])
  }, [members])


  return (
    <>
    <div className={'message-div-'+  (sent===true ? 'sent': 'received')}>
        <p className={'message '+  (sent===true ? 'sent': 'received')}>
          <small className='message-sender'>{group && sender && '~' + sender?.username}</small>
          { 
          text.split("\n").map(function(item, idx) {
            return (
                <span key={idx}>
                    {item}
                    <br/>
                </span>
            )
          })
        }
          <small className={'message-time-'+  (sent===true ? 'sent': 'received')}>{formatTime(time)}</small>
        </p>
    </div>
    </>
  )
};