import Modal from 'react-bootstrap/Modal'
import { Button } from '@mui/material';
import { useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useState } from 'react';
import { CircularProgress } from "@mui/material";
import { Request } from '../NotificationsModal/NotificationsModal';
import { axiosInstance } from '../../config';
import "./usersearchmodal.css"

const UserSearchModal = ({searchUserOpen, setSearchUserOpen, socket, requestsSent, setRequestsSent, requestsReceived, friends}) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const uid = useRef('');
  const friend = useRef(null);

  const handleClose = () =>{
    friend.current = null;
    setSearchUserOpen(!searchUserOpen);
  }

  const handleSubmit = async (e) =>{
    setIsLoading(true);
    e.preventDefault();

    try{
      const res = await axiosInstance.get('/users/uid/'+ uid.current.value.toLowerCase());
      friend.current = res.data
      console.log(res, "current")
    }catch(err){
      console.log(err);
      friend.current = null
    }
    finally{
      setIsLoading(false);
    }
  }

  return (
    <>
      <Modal
        show={searchUserOpen}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Search User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className='search-box'>
              <input type="text" className='search-input' placeholder='UID' ref={uid} required minLength="6"></input>
              <button type='submit' className='searchButton'>Search</button>
            </div>
          </form>
          
          {isLoading?
            <div className='search-loading'>
              <CircularProgress color="primary"/>
            </div> : <Profile 
            userSearched={friend.current} 
            handleClose={handleClose} 
            searchUserOpen={searchUserOpen} 
            currentUser={user} socket={socket} 
            requestsReceived={requestsReceived}
            requestsSent={requestsSent}
            setRequestsSent={setRequestsSent}
            friends={friends}
            />}
          
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

const Profile=({userSearched, handleClose, searchUserOpen, currentUser, socket, requestsReceived, requestsSent, setRequestsSent, friends})=>{
  const [sendingRequest, setSendingRequest] = useState(false);

  if(userSearched === null){
    return <div className='not-found'>Not found</div>
  }


  const handleRequest = async (e) =>{
    e.preventDefault();

    socket.current?.emit("sendRequest", {
      senderId: currentUser._id,
      receiverId: userSearched._id
    });

    try{
      setSendingRequest(true);
      const res = await axiosInstance.put('/users/' + userSearched._id + '/sendrequest', {userId: currentUser._id});
      setRequestsSent([...requestsSent, userSearched._id]);
    }catch(err){
      console.log(err);
    }finally{
      setSendingRequest(false);
    }

    handleClose(!searchUserOpen);
  }

  if((requestsReceived.filter(m=> m._id === userSearched._id).length > 0)){
    return (
      <Request fromUserId={userSearched._id} user={currentUser}></Request>
    );
  }

  console.log(requestsSent)

  return (
    <div className='contact-big'>
      <img src={"/images/" + (userSearched.profilePicture ? userSearched.profilePicture : "default.jpg")} className='profile-image-big' ></img>
      <div className='contact-info'>
        <h2 className='contact-name'>Username: {userSearched.username}</h2>
        <small className='contact-name'>UID: {userSearched.uid}</small>
        <small className='contact-name'>email: {userSearched.email}</small>
        <hr></hr>
        {
        sendingRequest ? 
        <Button variant="secondary" onClick={(e)=> e.preventDefault()}>
          <CircularProgress color="primary"/>
        </Button>
        :<WhichButton userSearched={userSearched} currentUser={currentUser} friends={friends} requestsSent={requestsSent} handleRequest={handleRequest} requestsReceived={requestsReceived}/>
        }
      </div>

    </div>
  );
}

const WhichButton = ({userSearched, currentUser, friends, requestsSent, handleRequest, requestsReceived}) =>{
  if(userSearched._id === currentUser._id){
    return (
      ""
    )
  }else{

    if(friends.filter(f => f === userSearched._id).length > 0){
      return(
        <Button variant="secondary" onClick={(e)=> e.preventDefault()}>
            Already friends
        </Button>
      )
    }else{

      if(requestsSent.filter(r => r === userSearched._id).length > 0){
        return (
          <Button variant="secondary" onClick={(e)=> e.preventDefault()}>
            Request Sent
          </Button>
        )
      }else{
        if(requestsReceived.filter(r => r === userSearched._id).length > 0){
          return (
            <Button variant="secondary" onClick={(e)=> e.preventDefault()}>
              Got a request from this user!
            </Button>
          );
        }else{
          return (
            <Button variant="custom" onClick={handleRequest}>
              Add friend
            </Button>
            )
        }
      }
    }

  }
};

export default UserSearchModal;