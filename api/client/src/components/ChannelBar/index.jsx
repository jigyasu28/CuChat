import { axiosInstance } from '../../config';
import { useEffect, useState } from "react"
import SearchIcon from '@mui/icons-material/Search';
import Messenger from '../Messenger/Messenger';
import ProfileBar from '../ProfileBar/ProfileBar';
import { useRef } from 'react';
import "./channelbar.css"
import { Badge } from '@mui/material';


const ChannelBar = ({ user, socket, usersOnline, conversation, setConversation, friends, setFriends, showGroups, setShowGroups, groupUnseen, personalUnseen, setGroupUnseen, setPersonalUnseen, unseenMessages, setUnseenMessages }) => {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isOpen, setIsopen] = useState(false);
  const [typingUser, setTypingUser] = useState({})

  // useEffect(()=>{
  //   for(let i in conversation){
  //     if(conversation[i].unseenMessageCount > 0){
  //       let unseenMessagetemp = unseenMessages;
  //       unseenMessagetemp[conversation[i]._id] = conversation[i].unseenMessageCount
  //       setUnseenMessages(unseenMessagetemp);
  //     }
  //   }
  // }, [conversation])
  
  const checkIfOnline = (conversation) =>{
    if(conversation!== null){
      if(conversation?.length === 0 ) return false;
      const friendId = conversation.members.find(m => m !== user._id);
      if(usersOnline.find(m => m.userId === friendId)) return true;
      return false;
    }
    return false
  }

  const handleConversationChange = async (c) =>{
    console.log(personalUnseen);
    setCurrentConversation(c);
    if(c?._id in unseenMessages){
      if(c.isGroup === true){
        setGroupUnseen(prev => prev - 1);
      }else{
        setPersonalUnseen(prev => prev - 1);
      }
      const res = await axiosInstance.post('conversations/' + c._id + '/count/', {
        count: 0
      })
      console.log(personalUnseen);
      delete unseenMessages[c._id];
    }
  }
  
  const filterResult = (event) =>{
    setSearchTerm(event.target.value)
  }

  const ToggleSidebar = () => {
    isOpen === true ? setIsopen(false) : setIsopen(true);
  }

  return (
  <>
    <div className='channelbar-container'>
      <ProfileBar 
        isOpen={isOpen} 
        setIsopen={setIsopen} 
        ToggleSidebar={ToggleSidebar} 
        user={user} me={true} 
        socket={socket} 
        friends={friends} 
        setFriends={setFriends} 
        conversation={conversation} 
        setConversation={setConversation} 
        currentUser = {user}
      />
      
      <div className='channelbar-container'>
        <div className='serach-box'>
          <div className='profile-container' onClick={ToggleSidebar}>
                <img src={"/images/" + (user.profilePicture ? user.profilePicture : "default.jpg")} className='profile-image-top'></img>
                <div className='profile-top-info'>
                  <h2 className='contact-name'>Usernmame: {user.username}</h2>
                  <p className='contact-name'>Email: { user.email }</p>
                </div>
          </div>
        </div>
      <div className='search-box'>
        <div className='search-container'>
          <SearchIcon/>
          <input type="text" className='search-input' onChange={filterResult}></input>
        </div>
      </div>
        {
          conversation.map((c)=>(
          <Conversation 
            key={c._id} 
            conversation={c} 
            currentUser={user} 
            onClick={()=>{handleConversationChange(c)}}
            isOnline={checkIfOnline(c)} 
            unseenMessages={unseenMessages} 
            setUnseenMessages={setUnseenMessages} 
            group={c.isGroup} 
            showGroups={showGroups}
            searchTerm={searchTerm}
            typingUser={typingUser}
            setTypingUser={setTypingUser}
            groupUnseen={groupUnseen}
            setGroupUnseen={setGroupUnseen}
            personalUnseen={personalUnseen}
            setPersonalUnseen={setPersonalUnseen}
          />
          ))
        }
        </div>
    </div>
    <Messenger 
      currentUser={user} 
      currentConversation={currentConversation} 
      setCurrentConversation={setCurrentConversation}
      conversation={conversation}
      setConversation={setConversation}
      socket={socket} 
      isOnline={checkIfOnline(currentConversation)} 
      setUnseenMessages={setUnseenMessages}
      unseenMessages={unseenMessages}
      friends={friends}
      setFriends={setFriends}
      typingUser={typingUser}
      setTypingUser={setTypingUser}
    />
  </>
  );
};

const Conversation = ({ conversation, currentUser, onClick, isOnline, unseenMessages, setUnseenMessages, group, showGroups, searchTerm, typingUser, groupUnseen, setGroupUnseen, personalUnseen, setPersonalUnseen }) => {
  const [user, setUser] = useState(null);
  const members = useRef([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  // useEffect(()=>{
  //   const updateCount = async () =>{
  //     if(conversation?._id in unseenMessages && conversation.isGroup === true && lastMessage.sender !== currentUser._id){
  //       setGroupUnseen(prev => prev + 1);
  //     }else if(conversation?._id in unseenMessages && conversation.isGroup !== true && lastMessage.sender !== currentUser._id){
  //       setPersonalUnseen(prev => prev + 1);
  //     }

  //     try{
  //       const res = await axiosInstance.post('conversations/' + conversation._id + '/count/', {
  //         count: unseenMessages[conversation._id],
  //         sender: lastMessage.sender
  //       })
  //     }catch(err){
  //       console.log(err);
  //     }
  //   }
  //   updateCount();
  // }, [unseenMessages, unseenMessages[conversation._id]])

  useEffect(()=>{

    if(conversation?.isGroup===false){
      if(user?._id === typingUser.userId && typingUser.conversationId === conversation._id){
        setIsTyping(typingUser.status);
      }
    }else{
      
      if(conversation?.members.includes(typingUser.userId) && typingUser.conversationId === conversation._id){
        setIsTyping(typingUser.status && currentUser._id !== typingUser.userId);
      }
    }
  }, [typingUser])

  useEffect( async ()=>{
    if(conversation !== null && conversation.isGroup === true && members.current.length === 0){
      try{
          for(let indx in conversation.members){
            const res = await axiosInstance.get("/users/" + conversation.members[indx]);
            members.current = [...members.current, res.data];
          }
      }catch(err){
          console.log(err)
      }
    }
  }, [conversation.members])

  useEffect(async ()=>{
    try{
      const res = await axiosInstance.get("/messages/" + conversation._id);
      setMessages(res.data);
    }catch(err){
      console.log(err)
    }
  }, [unseenMessages, messages])

  useEffect(()=>{
    if(conversation.isGroup === false){
      const friendId = conversation?.members.find(m => m !== currentUser._id);
      const getUser = async ()=> {
        try{
          const res = await axiosInstance.get("/users/" + friendId);
          setUser(res.data)
        }catch(err){
          console.log(err);
        }
      }
      getUser();
    }
  }, [conversation, currentUser])

  useEffect(()=>{
    if(messages.length > 0){
      setLastMessage(messages[messages.length - 1])
    }else{
      setLastMessage("")
    }
  }, [messages])

  if(group != showGroups){
    return '';
  }

  if(group===true){
    if(conversation?.name.includes(searchTerm)===false){
      return ""
    }
    return (
      <div className='contact' onClick={onClick}>
          <img src={"/images/" + (conversation?.groupPicture ? conversation?.groupPicture : "default.jpg")} className='profile-image' ></img>
          <div className='contact-info'>
            <h1 className='contact-name'>{conversation?.name}</h1>
            {isTyping ? <small className='message-text green-text'><b>{members.current?.filter(m => m._id === typingUser.userId)[0]?.username} is typing...</b></small>
            :messages.length===0 ? "": <small className='message-text'><b>{(lastMessage?.sender === currentUser._id) ? "You" : members.current?.filter(m=>m._id === lastMessage?.sender)[0]?.username}</b> : {lastMessage?.text}</small>}
          </div>
      </div>
    );

  }else{

    if(user?.username.includes(searchTerm)===false){
      return ""
    }
    return (
      
        <div className='contact' onClick={onClick}>
            <img src={"/images/" + user?.profilePicture} className={'profile-image ' + (isOnline?'online-image': 'offline-image')} ></img>
            <div className='contact-info'>
              <h1 className='contact-name'>{user?.username}</h1>
              {isTyping ? <small className='message-text green-text'><b>Typing...</b></small>
              : messages.length===0 ? "": <small className='message-text'><b>{(lastMessage.sender === currentUser._id) ? "You" : user?.username}</b> : {lastMessage?.text?.length > 40 ? lastMessage?.text?.substring(0, 40) + '...' : lastMessage?.text}</small>
              }
            </div>
        </div>
    );
  }
};


export default ChannelBar;
