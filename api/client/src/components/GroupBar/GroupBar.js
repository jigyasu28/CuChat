import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import { axiosInstance } from '../../config';
import { useEffect, useState, useRef } from 'react';

import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { CircularProgress, LinearProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import AddMembersModal from '../AddMembersModal/AddMembersModal';

import { Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';

import "./groupbar.css"

const GroupBar = ({isOpen, socket, ToggleSidebar, currentUser, conversation, setConversation, friends, setFriends, currentConversation, setCurrentConversation}) => {
    const [members, setMembers] = useState(currentConversation.members);
    const [disabledGroupName, setDisabledGroupName] = useState(true);
    const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [updatingName, setUpdatingName] = useState(false);

    const nameRef = useRef();

    useEffect(()=>{
        setMembers(currentConversation.members);
    }, [currentConversation, currentConversation.members])

    const handleGroupName = async () =>{
        if(disabledGroupName === true){
            setDisabledGroupName(false);
        }else{
            try{
                setUpdatingName(true);
                const res = await axiosInstance.post("/conversations/"+ currentConversation._id +"/name", {
                    userId: currentUser._id,
                    name: nameRef.current.value
                })

                currentConversation.name = nameRef.current.value;                
            }catch(err){
                console.log(err)
            }finally{
                setDisabledGroupName(true);
                setUpdatingName(false);
            }
        }
    }

    const handleAddMembers = () =>{
        setAddMembersModalOpen(true);
    }

    const handleDeleteGroup = async () =>{
        if(currentConversation){
            const res = await axiosInstance.delete("/conversations/" + currentConversation._id, {userId: currentUser._id});

            socket.current.emit("deleteGroupConversation", {
                receiverArray: currentConversation.members,
                senderId: currentUser._id,
                conversationId: currentConversation._id
            });
        }
        ToggleSidebar();
    }

    const handleLeaveGroup = async () =>{
        setLeaving(true);
        try{
            const rem = await axiosInstance.post('/conversations/leave', {
                userId: currentUser._id,
                conversationId: currentConversation._id
            });

            let message = {
                sender: currentUser._id,
                text: 'System [ ' + currentUser.username + ' has left the group ]',
                conversationId: currentConversation._id,
                createdAt: Date.now()
            }

            const msg = await axiosInstance.post("/messages", message);

            if(currentConversation.admins.includes(currentUser._id) && currentConversation.admins.length === 1){
                const randomAdminId = currentConversation.members.filter(f => f!== currentUser._id)[Math.floor(Math.random()*(currentConversation.members.length - 1))];
                const res = await axiosInstance.get('/users/' + randomAdminId);
    
                const rem = await axiosInstance.post('/conversations/makeadmin', {
                    userId: currentUser._id,
                    memberId: randomAdminId,
                    conversationId: currentConversation._id
                });
    
                let name = res.data.username;
    
                message = {
                    sender: currentUser._id,
                    text: 'System [ ' + name + ' is now an admin ]',
                    conversationId: currentConversation._id,
                    createdAt: Date.now()
                }

                const msg = await axiosInstance.post("/messages", message);
    
                socket.current?.emit("makeAdmin", {
                    memberId: randomAdminId,
                    userId: currentUser._id,
                    conversationId: currentConversation._id,
                    receiverArray: currentConversation.members.filter(m => m!== currentUser._id),
                });
                
                socket.current?.emit("sendGroupMessage", {
                    senderId: currentUser._id,
                    receiverArray: currentConversation.members.filter(m => m!== currentUser._id),
                    message: message
                });
        
                let temp = currentConversation
                temp.admins = [...temp.admins, randomAdminId]
                setCurrentConversation(temp);
            }

            socket.current?.emit("leaveMember", {
                userId: currentUser._id,
                conversationId: currentConversation._id,
                receiverArray: currentConversation.members.filter(m => m!== currentUser._id)
            });
    
            socket.current?.emit("sendGroupMessage", {
                senderId: currentUser._id,
                receiverArray: currentConversation.members,
                message: message
            });
    
            let temp = currentConversation
            temp.members = temp.members.filter(m => m !== currentConversation._id)

            setMembers([])
            setConversation(prev =>prev.filter(c => c._id !== currentConversation._id))
            setCurrentConversation(null);
            ToggleSidebar();

        }catch(err){
            console.log(err)
        }finally{
            setLeaving(false);
        }
        
    }

    return (
        <>
            <AddMembersModal
                addMembersModalOpen={addMembersModalOpen}
                setAddMembersModalOpen={setAddMembersModalOpen}
                friends={friends}
                currentConversation={currentConversation}
                setCurrentConversation={setCurrentConversation}
                currentUser={currentUser}
                conversation={conversation}
                setConversation={setConversation}
                socket={socket}
            />
            <div className={`profilebar ${isOpen === true ? 'active' : ''} other`}>
                <div className="sd-header">
                    <h4 className="mb-0">Group</h4>
                    <div className="btn" onClick={ToggleSidebar}><CloseIcon/></div>
                </div>
                <div className='profilebar-profilepic'>
                <img src={"/images/" + (currentConversation?.groupPicture ? currentConversation.groupPicture : "default.jpg")} className='profile-image-big' alt='grp-img'></img>
                </div>
                <div className="sd-body">
                    <div className='user-info'>
                        <ul>
                            <li className='title-text'>Group Name : </li>

                            {disabledGroupName ? 
                                <input className='name-input' type="text" value={currentConversation.name} disabled/>
                                :<input className='name-input editable' type="text" defaultValue={currentConversation.name} ref={nameRef}/>
                            }
                            { currentConversation.admins.includes(currentUser._id) ?
                            <div className='edit' onClick={handleGroupName}>
                                <IconButton>
                                    {updatingName ? <CircularProgress size={"20px"}/>:
                                    disabledGroupName ? <EditIcon className='hover-button'/> : <DoneIcon />}
                                </IconButton>
                            </div>
                            : ''}
                        </ul>
                    </div>
                    <div className='gp-icon-container'>
                        <Tooltip title="Add member">
                            <IconButton onClick={handleAddMembers}>
                                <AddBoxIcon fontSize='large'/>
                            </IconButton>
                        </Tooltip>
                        
                        {
                        currentConversation?.admins.includes(currentUser._id)?
                        <div className='delete-icon'>
                        <Tooltip title="Delete Group">
                            <IconButton onClick={handleDeleteGroup}>
                                <DeleteIcon fontSize='large'/>
                            </IconButton>
                        </Tooltip>
                        </div>
                        : ''
                        }
                    </div>
                    <div className='member-container'>
                    {
                        members.map((m)=>(
                            <Member
                                key={m} 
                                userId={m} 
                                isAdmin={currentConversation?.admins.includes(m)} 
                                adminAccess={currentConversation?.admins.includes(currentUser._id)} 
                                currentUser={currentUser}
                                currentConversation={currentConversation}
                                setCurrentConversation={setCurrentConversation}
                                socket={socket}
                                setMembers={setMembers}
                            />
                        ))
                    }
                    </div>
                </div>
                {leaving ?
                <Button variant="secondary" onClick={()=>{}} className="unfriend-button">
                <CircularProgress fontSize="smallest"/>
                </Button>
                :
                <Button variant="secondary" onClick={handleLeaveGroup} className="unfriend-button">
                Leave Group
                </Button>
                }
            </div>
            <div className={`profilebar-overlay ${isOpen === true ? 'active' : ''}`} onClick={ToggleSidebar}></div>

        </>
    )
}

const Member = ({userId, isAdmin, adminAccess, currentUser, currentConversation, setCurrentConversation, socket, setMembers}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [changing, setChanging] = useState(false);

    useEffect(()=>{
        const getUser = async () =>{
            setLoading(true);
            try{
                const res = await axiosInstance.get("/users/" + userId);
                setUser(res.data);
            }catch(err){
                console.log(err)
            }finally{
                setLoading(false);
            }
        }
        getUser();
    }, [])

    const handleMakeAdmin = async () =>{
        try{
            setChanging(true);
            const res = await axiosInstance.get('/users/' + userId);

            const rem = await axiosInstance.post('/conversations/makeadmin', {
                userId: currentUser._id,
                memberId: userId,
                conversationId: currentConversation._id
            });

            let name = res.data.username;

            const message = {
                sender: currentUser._id,
                text: 'System [ ' + name + ' is now an admin ]',
                conversationId: currentConversation._id,
                createdAt: Date.now()
            }

            socket.current?.emit("makeAdmin", {
                memberId: userId,
                userId: currentUser._id,
                conversationId: currentConversation._id,
                receiverArray: currentConversation.members
            });
            
            socket.current?.emit("sendGroupMessage", {
                senderId: currentUser._id,
                receiverArray: currentConversation.members,
                message: message
            });

            const msg = await axiosInstance.post("/messages", message);
    
            let temp = currentConversation
            temp.admins = [...temp.admins, userId]
            setCurrentConversation(temp);

        }catch(err){
            console.log(err)
        }finally{
            setChanging(false);
        }
    }

    const handleRemoveMember = async () =>{
        try{
            setChanging(true);
            const res = await axiosInstance.get('/users/' + userId);

            let name = res.data.username;

            console.log(currentConversation)

            const rem = await axiosInstance.post('/conversations/remove', {
                userId: currentUser._id,
                memberId: userId,
                conversationId: currentConversation._id
            });

            const message = {
                sender: currentUser._id,
                text: 'System [ ' + name + ' has been removed from group ]',
                conversationId: currentConversation._id,
                createdAt: Date.now()
            }

            socket.current?.emit("removeMember", {
                memberId: userId,
                userId: currentUser._id,
                conversationId: currentConversation._id,
            });
    
            socket.current?.emit("sendGroupMessage", {
                senderId: currentUser._id,
                receiverArray: currentConversation.members,
                message: message
            });

            const msg = await axiosInstance.post("/messages", message);
    
            let temp = currentConversation;
            temp.members = temp.members.filter(m => m !== userId)
            setCurrentConversation(temp);
    
            setMembers(prev=> prev.filter(m => m !== userId))

        }catch(err){
            console.log(err)
        }finally{
            setChanging(false);
        }
        
    }

    return (
      <div className='contact bordered-contact '>
        {loading ?
        <div className='search-loading'>
            <CircularProgress/>
        </div>
        :
        <>
            <img src={"/images/" + (user?.profilePicture ? user?.profilePicture : "default.jpg")} className='profile-image ' ></img>
            
            <div className='contact-info'>
                <h1 className='contact-name'>{user?.username}</h1>
                <small className='admin-user'>{isAdmin ? 'admin': ''}</small>
            </div>
            { changing ? <CircularProgress/>:
                adminAccess && !isAdmin ? 
                <>
                <Tooltip title="Make Admin">
                    <IconButton variant="primary" onClick={handleMakeAdmin}>
                        <AddCircleRoundedIcon fontSize="large"/>
                    </IconButton>
                </Tooltip>
                
                <Tooltip title="Remove member">
                    <IconButton variant="primary" onClick={handleRemoveMember}>
                        <PersonRemoveIcon fontSize="large"/>
                    </IconButton>
                </Tooltip>
                </>
                : ""
            }
        </>
        }   
      </div>
    );
}

export default GroupBar;