import Modal from 'react-bootstrap/Modal'
import { Button } from '@mui/material';
import { useContext, useEffect, useRef } from 'react';
import { useState } from 'react';
import { CircularProgress } from "@mui/material";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { axiosInstance } from '../../config';
import "./notificationsmodal.css"


const NotificationsModal = ({notificationsOpen, setNotificationsOpen, user, socket, requestsReceived, setRequestsReceived, requestsSent, setRequestsSent, conversation, setConversation, friends, setFriends}) => {
  const [isLoading, setIsLoading] = useState(false);
  const uid = useRef('');
  const friend = useRef(null);

  useEffect(()=>{
    socket.current?.on("getRequest", data=>{
      if(!requestsReceived.includes(data.senderId)){
        console.log("request Received")
        setRequestsReceived([...requestsReceived, data.senderId]);
      }
    });

    socket.current?.on("removeRequestSent", data=>{
        setRequestsSent(requestsSent.filter(r => r !== data.senderId));
    });

    socket.current?.on("addConversation", data=>{
        console.log(data, "data received");
        setConversation([...conversation, data.conversation]);
        console.log(friends, data.senderId, "sent conversations")
        setFriends([...friends, data.senderId])
        setRequestsSent(requestsSent.filter(r => r !== data.senderId))
        console.log(friends)
    });

  })

  console.log(user)

  const handleClose = () =>{
    friend.current = null;
    setNotificationsOpen(!notificationsOpen);
  }

  const handleSubmit = async (e) =>{
    setIsLoading(true);
    e.preventDefault();

    try{
      const res = await axiosInstance.get('/users/uid/'+ uid.current.value.toLowerCase());
      friend.current = res.data
      console.log(friend.current)
    }catch(err){
      console.log(err);
      friend.current = null
    }
    finally{
      setIsLoading(false);
    }
  }

  if(requestsReceived.length === 0){
    return (
      <>
        <Modal
          show={notificationsOpen}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Friend Requests</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <div className='no-request'>
            No new requests found
          </div>    
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
    <>

      <Modal
        show={notificationsOpen}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Friend Requests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className='request-modal'>
          {requestsReceived.map(m=>
            (<Request 
                  key={m} 
                  fromUserId={m} 
                  user={user} 
                  requestsReceived={requestsReceived} 
                  setRequestsReceived={setRequestsReceived} 
                  conversation={conversation} 
                  setConversation={setConversation} 
                  socket={socket}
                  friends={friends}
                  setFriends={setFriends}
            />))
          }
        </div>    
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export const Request=({fromUserId, user, requestsReceived, setRequestsReceived, conversation, setConversation, socket, friends, setFriends})=>{
  const [fromUser, setFromUser] = useState(null)
  const [handlingRequest, setHandlingRequest] = useState(false);

  useEffect(()=>{
    const getCurrentUser = async () =>{
      try{
        console.log(fromUserId)
        const res = await axiosInstance.get('/users/'+fromUserId);
        setFromUser(res.data);
      }catch(err){
        console.log(err);
      }
    }
    getCurrentUser();
  }, [fromUserId])

  if(fromUser === null){
    return <div>User not found</div>
  }

  const handleRequestAccept = async (e) =>{
    e.preventDefault();
    setHandlingRequest(true);

    try{
      const res = await axiosInstance.put('/users/'+fromUser._id+'/acceptrequest', {userId: user._id});
      const conv_res = await axiosInstance.post('/conversations/personal/', {members: [user._id, fromUser._id]});

      setConversation([...conversation, conv_res.data]);
      setRequestsReceived( requestsReceived.filter(r => r !== fromUserId) )
      setFriends([...friends, fromUserId])

      socket.current.emit("sendConversation", {
        receiverId: fromUserId,
        senderId: user._id,
        conversation: conv_res.data
      });

    }catch(err){
      console.log(err);
    }
    finally{
      setHandlingRequest(false);
    }
  }

  const handleRequestReject = async (e) =>{
    e.preventDefault();
    setHandlingRequest(true);

    try{
      const res = await axiosInstance.put('/users/'+fromUser._id+'/rejectrequest', {userId: user._id});
      setRequestsReceived( requestsReceived.filter(r => r !== fromUserId) )
      console.log(res);
      socket.current.emit("sendRejection", {
        receiverId: fromUserId,
        senderId: user._id
      });
    }catch(err){
      console.log(err);
    }finally{
      setHandlingRequest(false);
    }
  }

  return (
    <div className='contact-mid'>
      <img src={fromUser.profilePicture ? "/images/" + fromUser.profilePicture :"../profiles/profile.jpg"} className='profile-image-mid' ></img>
      <div className='contact-info'>
        <h2 className='contact-name'>Username: {fromUser.username}</h2>
        <small className='contact-name'>UID: {fromUser.uid}</small>
        <small className='contact-name'>email: {fromUser.email}</small>
        <hr></hr>
        Accept friend request?
        <div className='request-button-grp'><br></br>
        { handlingRequest ?
        <CircularProgress color='primary'/>
        :
        <div>
          <Button className={'accept'} onClick={handleRequestAccept}><DoneIcon/></Button>
          <Button className={'reject'} onClick={handleRequestReject}><CloseIcon/></Button>
        </div>
        } 
        </div>
      </div>

    </div>
  );
}

export default NotificationsModal;