import Home from "./pages/Homepage/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { AuthContext } from "./context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useContext } from "react";

function App() {

  const {user} = useContext(AuthContext)

  return (
    <Router>
      <Routes>
        <Route exact path='/' element={user? <Home/> : <Login/>} />
        <Route exact path="/login" element={user ? <Navigate to="/" replace /> : <Login/> } />
        <Route exact path="/register" element={user ? <Navigate to="/" replace /> : <Register/> } />
      </Routes>
    </Router>
  );
}

export default App;
