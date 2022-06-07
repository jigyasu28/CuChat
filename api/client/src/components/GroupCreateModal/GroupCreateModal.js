import Modal from 'react-bootstrap/Modal'
import Button from '@mui/material/Button'
import DoneIcon from '@mui/icons-material/Done';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { axiosInstance } from '../../config';
import "./groupcreatemodal.css"
import { CircularProgress } from '@mui/material';


const GroupCreateModal = ({groupModalOpen, setGroupModalOpen, friends, currentUser, socket, setConversation}) => {
  const [members, setMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const groupName = useRef('');

  const handleClose = () =>{
    setGroupModalOpen(!groupModalOpen);
  }

  const handleCreate = async () =>{
    if(groupName.current.value === ''){
      alert("Group name cannot be empty");
      return;
    }

    try{
      setCreating(true);
      const res = await axiosInstance.post("/conversations/group/", {
        members: [...members, currentUser._id],
        creatorId: currentUser._id,
        admins: [currentUser._id],
        name: groupName.current.value
      })

      socket.current.emit("sendGroupConversation", {
        receiverArray: members,
        senderId: currentUser._id,
        conversation: res.data
      });

      setConversation(prev => [...prev, res.data])

    }catch(err){
      console.log(err);
    }finally{
      setMembers([])
      groupName.current = ''
      setGroupModalOpen(false);
      setCreating(false);
    }
  }

  return (
    <>
      <Modal
        show={groupModalOpen}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className='search-box'>
              <input type="text" className='search-input' placeholder='Group Name' required minLength="1" ref={groupName}></input>
            </div>
          <hr></hr>
          <div>
            <h2 className='title-text'>Select members</h2>
          </div>
          <hr></hr>
          <div className='member-container'>
            <div className='member-container'>
            {
              friends.map((f)=>(
                <Member key={f} friendId={f} members={members} setMembers={setMembers}/>
              ))
            }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {creating ? <CircularProgress/>:
            <Button variant='custom' onClick={handleCreate}>
              Create
            </Button>
          }
        </Modal.Footer>
      </Modal>
    </>
  );
}

const Member = ({friendId, members, setMembers}) =>{
  const [user, setUser] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const getUser = async ()=> {
      setLoading(true);
      try{
        const res = await axiosInstance.get("/users/" + friendId);
        console.log(res, "asdasdas")
        setUser(res.data);
      }catch(err){
        console.log(err);
      }finally{
        setLoading(false);
      }
    }
    getUser();
  }, [])

  const selectMember = () =>{
    if(isSelected === true){
      setIsSelected(false);
      setMembers(members.filter(m => m !== friendId))
    }else{
      setIsSelected(true);
      setMembers([...members, friendId])
    }
  }

  return (
    <div className={'contact bordered-contact ' + (isSelected ? 'member-selected' : '')} onClick={selectMember}>
      { loading? 
        <div className='search-loading'>
          <CircularProgress/>
        </div>
      :
      <>
          <img src={"/images/" + (user?.profilePicture ? user?.profilePicture : "default.jpg")} className='profile-image ' ></img>
        <div className='contact-info'>
          <h1 className='contact-name'>{user?.username}</h1>
          {isSelected ? <DoneIcon/> : ""}
        </div>
      </>
      }
    </div>
  );
}

export default GroupCreateModal;