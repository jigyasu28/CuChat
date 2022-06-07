import Modal from 'react-bootstrap/Modal'
import Button from '@mui/material/Button'
import DoneIcon from '@mui/icons-material/Done';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { axiosInstance } from '../../config';
import "./addmembersmodal.css"
import { CircularProgress } from '@mui/material';


const AddMembersModal = ({socket, addMembersModalOpen, setAddMembersModalOpen, friends, currentUser, currentConversation, setCurrentConversation, conversation, setConversation}) => {
  const [members, setMembers] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) =>{
    setUserName(e.target.value);
    console.log(members)
  }

  const handleClose = () =>{
    setAddMembersModalOpen(!addMembersModalOpen);
  }

  const handleAddMembers = async () =>{
    try{
      setLoading(true);

      const memberIds = members.map(m=> m._id);
      console.log(memberIds)

      const res = await axiosInstance.post('/conversations/group/'+currentConversation._id+'/addmember/', {
        userId: currentUser._id,
        conversationId: currentConversation._id,
        members: memberIds
      })

      let curr = currentConversation;
      curr.members = [...curr.members, ...memberIds];

      setCurrentConversation(curr)

      setConversation(prev=>{
        return [...prev.filter(c => c._id !== curr._id), curr];
      })

      socket.current.emit("sendGroupConversation", {
        receiverArray: memberIds,
        senderId: currentUser._id,
        conversation: curr
      });

      setLoading(false)

      for(let i in members){
        let message = {
          sender: currentUser._id,
          text: "System [" + members[i].username + " has been added to group ]",
          conversationId: currentConversation._id,
          createdAt: Date.now()
        }
        
        socket.current.emit("sendGroupMessage", {
          receiverArray: curr.members,
          senderId: currentUser._id,
          message: message
        });

        const msg = await axiosInstance.post("/messages", message);
      }

    }catch(err){
      console.log(err);
    }finally{
      setMembers([]);
      setLoading(false);
    }
  }

  return (
    <>
      <Modal
        show={addMembersModalOpen}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className='search-box'>
              <input type="text" className='search-input' placeholder='Search User' onChange={handleSearch}></input>
            </div>
          <hr></hr>
          <div>
            <h4 className='title-text'>Select members</h4>
          </div>
          <hr></hr>
          <div className='member-container'>
            <div className='member-container'>
            {
              friends.filter(f => !currentConversation.members.includes(f)).map((f)=>(
                <Member key={f} friendId={f} members={members} setMembers={setMembers} userName={userName}/>
              ))
            }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {loading ? <CircularProgress/>:
          <Button variant='custom' onClick={handleAddMembers}>
            Add
          </Button>
          }
        </Modal.Footer>
      </Modal>
    </>
  );
}

const Member = ({friendId, members, setMembers, userName}) =>{
  const [user, setUser] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  
  useEffect(()=>{
    const getUser = async ()=> {
      try{
        const res = await axiosInstance.get("/users/" + friendId);
        setUser(res.data);
      }catch(err){
        console.log(err);
      }
    }
    getUser();
  }, [friendId])

  const selectMember = () =>{
    if(isSelected === true){
      setIsSelected(false);
      setMembers(members.filter(m => m._id !== friendId))
    }else{
      setIsSelected(true);
      setMembers([...members, user])
    }
  }

  if(!user?.username?.includes(userName)){
    return "";
  }

  return (
    <div className={'contact bordered-contact ' + (isSelected ? 'member-selected' : '')} onClick={user!==null ? selectMember : ()=>{}}>
        {user !== null ? 
        <>
          <img src={"/images/" + (user?.profilePicture ? user?.profilePicture : "default.jpg")} className='profile-image ' ></img>
          <div className='contact-info'>
            <h1 className='contact-name'>{user?.username}</h1>
            {isSelected ? <DoneIcon/> : ""}
          </div>
        </>:<CircularProgress/>
        }
    </div>
  );
}

export default AddMembersModal;