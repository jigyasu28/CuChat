import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import { IconButton } from '@mui/material';
import { useRef } from 'react';
import { Badge } from '@mui/material';
import { CircularProgress } from '@mui/material';

import { axiosInstance } from '../../config';
import "./profilebar.css"
import { useState } from 'react';

const ProfileBar = ({isOpen, socket, ToggleSidebar, user, me, currentUser, conversation, setConversation, friends, setFriends, currentConversation, setCurrentConversation}) => {
    const [disabledDescription, setDescriptionDisabled] = useState(true);
    const [disabledProfile, setProfileDisabled] = useState(true);
    const [updatingDesc, setUpdatingDesc] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [updatingName, setUpdatingName] = useState(false);

    const descRef = useRef();
    const profileRef = useRef();


    const handleFile = async (e) =>{
        e.preventDefault();
        
        let file = e.target.files[0];
        if(file){
            const data = new FormData();
            const filename = file.name;

            console.log(filename);

            data.append("image", file);
            data.append("filename", filename);
            data.append("userId", currentUser?._id);

            try{
                setUploadingFile(true);
                await axiosInstance.post('/users/' + currentUser?._id + '/profile', data);
            }catch(err){
                console.log(err);
            }finally{
                setUploadingFile(false);
            }
        }
    }

    const handleProfileSubmit = async () =>{
        if(disabledProfile === true){
            setProfileDisabled(false);
        }else{
            try{
                setUpdatingName(true);
                const res = await axiosInstance.post("/users/"+currentUser._id+"/username", {
                    userId: currentUser._id,
                    username: profileRef.current.value
                })
                console.log("changed");
                currentUser.username = profileRef.current.value;
            }catch(err){
                console.log(err);
            }finally{
                setProfileDisabled(true);
                setUpdatingName(false);
            }
        }
    }

    const handleDescriptionSubmit = async () =>{
        if(disabledDescription === true){
            setDescriptionDisabled(false);
        }else{
            try{
                setUpdatingDesc(true);
                const res = await axiosInstance.post("/users/"+currentUser._id+"/desc", {
                    userId: currentUser._id,
                    description: descRef.current.value
                })
                console.log("changed");
                currentUser.desc = descRef.current.value;
            }catch(err){
                console.log(err);
            }finally{
                setDescriptionDisabled(true);
                setUpdatingDesc(false);
            }
        }
    }

    const handleUnfriend =async ()=>{
        try{

            setFriends(friends.filter(f=> f != user._id));
            setConversation(conversation.filter(c => c._id !== currentConversation._id));

            const res = await axiosInstance.put("/users/" + user._id + "/unfollow", {userId: currentUser._id});
            const conv_res = await axiosInstance.delete("/conversations/" + currentConversation._id, {userId: currentUser._id});

            socket.current.emit("deleteConversation", {
                receiverId: user._id,
                senderId: currentUser._id,
                conversationId: currentConversation._id
            });

            ToggleSidebar();

        }catch(err){
            console.log(err);
        }
        finally{
            setCurrentConversation(null);
        }
    };

    return (
        <>
            <div className={`profilebar ${isOpen == true ? 'active' : ''} ${me === true ? 'me' : 'other'}`}>
                
                <div className="sd-header">
                    <h4 className="mb-0">Profile</h4>
                    <div className="btn" onClick={ToggleSidebar}><CloseIcon/></div>
                </div>

                <div className='profilebar-profilepic'>
                    <Badge badgeContent={
                            me ?
                            <div className="image-upload">
                                <label htmlFor="file-input">
                                    {uploadingFile? <CircularProgress size={"20px"}/>:
                                    <CameraAltIcon fontSize='large' className='pic-upload-button'/>
                                    }
                                </label>
        
                                <input id="file-input" type="file" accept="image/png, image/jpeg" onChange={handleFile}/>
                            </div>
                            :''
                    } anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}>
                    <img src={'/images/' + (user.profilePicture ? user.profilePicture : "default.jpg")} className='profile-image-big'></img>
                    </Badge>

                </div>
                <div className="sd-body">
                        <div className='user-info'>
                            <ul>
                                <li>Username :</li>
                                {disabledProfile ? 
                                    <input className='name-input' type="text" value={user.username} disabled/>
                                    :<input className='name-input editable' type="text" ref={profileRef}/>
                                }
                                { me?
                                <div className='edit' onClick={handleProfileSubmit}>
                                    <IconButton>
                                        {updatingName? <CircularProgress fontSize="smallest" size={'20px'}/>:
                                        disabledProfile ? <EditIcon className='hover-button'/> : <DoneIcon />}
                                    </IconButton>
                                </div>
                                :''}
                                <li><b>UID :</b> {user.uid}</li>
                                <li><b>Joined :</b> {user.createdAt}</li>
                                <li><b>email :</b> {user.email}</li>

                                <hr></hr>

                                <li className='title-text'>Description :</li>
                                {me ? 
                                disabledDescription?
                                    <textarea className='desc-input' type="text" value={currentUser.desc? currentUser.desc:"Enter a description"} disabled/>
                                    :<textarea className='desc-input editable' type="text" ref={descRef} defaultValue={currentUser.desc}/>
                                : <textarea className='desc-input' type="text" placeholder={user.desc? user.desc:"No description added by user"} disabled/>
                                }
                                {me ? <div className='edit' onClick={handleDescriptionSubmit}>
                                    <IconButton>
                                        {updatingDesc? <CircularProgress size={'20px'}/>:
                                        disabledDescription ? <EditIcon/> : <DoneIcon/>}
                                    </IconButton>
                                </div>: ''}
                            </ul>
                            
                        </div>
                </div>
                { !me ? 
                <Button variant='primary' onClick={handleUnfriend} className="unfriend-button">
                    Block
                </Button>: ""
                }
            </div>
            <div className={`profilebar-overlay ${isOpen == true ? 'active' : ''}`} onClick={ToggleSidebar}></div>
        </>
    )
}

export default ProfileBar;