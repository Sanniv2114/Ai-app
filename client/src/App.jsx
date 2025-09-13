import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import Loading from "./pages/Loading";
import { assets } from "./assets/assets";
import "./assets/prism.css";
import { useAppContext } from "./context/AppContext";
import Login from "./pages/Login";


const App = () => {

  const {user}=useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Icon */}
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert"
          onClick={() => setIsMenuOpen(true)}
        />
      )}

{user? (
      <div className="bg-white text-black dark:bg-gradient-to-b dark:from-[#242124] dark:to-[#000000] dark:text-white">
        <div className="flex h-screen w-screen">
          <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <Routes>
            {/* ✅ Now /loading is handled by React Router */}
            <Route path="/loading" element={<Loading />} />
            <Route path="/" element={<ChatBox />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </div>
      </div>
):(

  <div className="bg-gradient-to-b from-[#242124] to-[#000000] flex
  items-center justify-center h-screen w-screen">
    <Login/>
  </div>
)}
      {/* Main Layout */}

    </>
  );
};

export default App;

