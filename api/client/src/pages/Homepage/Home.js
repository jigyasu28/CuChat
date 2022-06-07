import SideBar from "../../components/SideBar"
import ChannelBar from "../../components/ChannelBar"
import {io} from "socket.io-client"
import { useRef, useEffect, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { axiosInstance } from "../../config";


export default function Home() {
  const {user} = useContext(AuthContext);
  const socket = useRef(null);
  const [usersOnline, setUsersOnline] = useState([]);

  const [requestsReceived, setRequestsReceived] = useState(user.requestsReceived);
  const [requestsSent, setRequestsSent] = useState(user.requestsSent);
  const [friends, setFriends] = useState(user.friends);
  const [conversation, setConversation] = useState([]);
  const [showGroups, setShowGroups] = useState(false);

  const [unseenMessages, setUnseenMessages] = useState({});
  // const [groupUnseen, setGroupUnseen] = useState(0);
  // const [personalUnseen, setPersonalUnseen] = useState(0);

  useEffect(()=>{
    socket.current = io("https://cuchatapp-socket.herokuapp.com/");
  
    const getConversations = async () => {
      try{
        const res = await axiosInstance.get("/conversations/" + user._id)
        setConversation(res.data);
      }catch(err){
        console.log(err);
      }
    };

    getConversations();
  }, [])

  useEffect(()=>{
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", users=>{
      setUsersOnline(users);
    })
  }, [])

  useEffect(()=>{
    socket.current?.on("getGroupConversation", data=>{
      setConversation(prev => [...prev, data.conversation])
    });
  }, [])

  return (
    <div className="flex">
      <SideBar
        socket={socket}
        requestsReceived={requestsReceived}
        setRequestsReceived={setRequestsReceived}
        requestsSent={requestsSent}
        setRequestsSent={setRequestsSent}
        friends={friends}
        setFriends={setFriends} 
        conversation={conversation} 
        setConversation={setConversation}
        showGroups={showGroups}
        setShowGroups={setShowGroups}
      />
    <div className="flex full">
        <ChannelBar
        user={user} 
        usersOnline={usersOnline} 
        socket={socket}
        conversation={conversation} 
        setConversation={setConversation}
        friends={friends}
        setFriends={setFriends} 
        showGroups={showGroups}
        setShowGroups={setShowGroups}
        unseenMessages={unseenMessages}
        setUnseenMessages={setUnseenMessages}
        // groupUnseen={groupUnseen}
        // setGroupUnseen={setGroupUnseen}
        // personalUnseen={personalUnseen}
        // setPersonalUnseen={setPersonalUnseen}
        />
    </div>
    </div>
  )
}
