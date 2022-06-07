import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton } from '@mui/material';
import GroupCreateModal from '../GroupCreateModal/GroupCreateModal';
import UserSearchModal from '../UserSearchModal/UserSearchModal';
import NotificationsModal from '../NotificationsModal/NotificationsModal';
import { logoutCall } from '../../apiCalls';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import "./sidebar.css"

const SideBar = ({ socket, requestsReceived, setRequestsReceived, requestsSent, setRequestsSent, friends, setFriends, conversation, setConversation, setShowGroups, personalUnseen, groupUnseen }) => {
  const { user, dispatch } = useContext(AuthContext);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [searchUserOpen, setSearchUserOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false);



  const handleOpenGroupCreate = () =>{
    setGroupModalOpen(!groupModalOpen);
  }
  const handleOpenUserSearch = () =>{
    setSearchUserOpen(!searchUserOpen);
  }

  const handleLogout = () => {
    logoutCall(dispatch);
    socket.current.disconnect();
  }

  const handleOpenNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  }

  return (
    <>
    <GroupCreateModal 
      groupModalOpen={groupModalOpen} 
      setGroupModalOpen={setGroupModalOpen}
      friends={friends}
      currentUser={user}
      socket={socket}
      setConversation={setConversation}
    />
    <UserSearchModal 
      searchUserOpen={searchUserOpen}
      setSearchUserOpen={setSearchUserOpen} 
      socket={socket} 
      requestsSent={requestsSent}
      setRequestsSent={setRequestsSent}
      requestsReceived={requestsReceived}
      friends={friends}
    />
    <NotificationsModal
      notificationsOpen={notificationsOpen}
      setNotificationsOpen={setNotificationsOpen} 
      user={user} 
      socket={socket} 
      requestsReceived={requestsReceived} 
      setRequestsReceived={setRequestsReceived} 
      requestsSent={requestsSent}
      setRequestsSent={setRequestsSent}
      friends={friends}
      setFriends={setFriends}
      conversation={conversation} 
      setConversation={setConversation}
    />
    <div className="top-0 left-0 h-screen w-16 flex flex-col
                  bg-white dark:bg-gray-900 shadow-lg sidebar-fixed">

        <div onClick={() => setShowGroups(false)} >
          {  personalUnseen > 0 ?
          <IconButton style={{ backgroundColor: "transparent" }}>
            <Badge badgeContent=' ' color="secondary" overlap="circular">
              <SideBarIcon icon={<PersonIcon/>} text={"Personal Contacts"} />
            </Badge>
          </IconButton>
          : <SideBarIcon icon={<PersonIcon/>} text={"Personal Contacts"} />
          }
        </div>
        <div onClick={() =>setShowGroups(true)} >
          { groupUnseen > 0 ?
          <IconButton style={{ backgroundColor: "transparent" }}>
            <Badge badgeContent=' ' color="secondary" overlap="circular">
              <SideBarIcon icon={<GroupIcon/>} text={"Groups"} />
            </Badge>
          </IconButton>
          :<SideBarIcon icon={<GroupIcon/>} text={"Groups"} />
          }
        </div>

        <Divider />
        <div onClick={handleOpenGroupCreate}><SideBarIcon icon={<GroupAddIcon/>} text={"Create Group"}/></div>
        <div onClick={handleOpenUserSearch}><SideBarIcon icon={<PersonAddAltIcon/>} text={"Search User"} /></div>
        <div onClick={handleOpenNotifications}><SideBarIcon icon={
          requestsReceived.length === 0 ? <NotificationsIcon/> :          
          <Badge badgeContent={requestsReceived.length} color="secondary">
            <NotificationsIcon/>
          </Badge>
        } text={"Search User"} /></div>
        <div className='logout-icon' onClick={handleLogout}>
          <Divider />
          <SideBarIcon icon={<LogoutIcon/>} text={"Logout"} />
        </div>
    </div>
    </>
  );
};

const SideBarIcon = ({ icon, text = 'tooltip 💡' }) => (
  <div className="sidebar-icon group">
    {icon}
    <span className="sidebar-tooltip group-hover:scale-100">
      {text}
    </span>
  </div>
);


const Divider = () => <hr className="sidebar-hr" />;

export default SideBar;