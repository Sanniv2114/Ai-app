// src/context/AppContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Helper to include Bearer token
  const getAuthHeader = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  // ✅ Fetch logged-in user data
  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: getAuthHeader(),
      });

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
        setUser(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // ✅ Create a new chat and return it
  const createNewChat = async () => {
    try {
      const { data } = await axios.post("/api/chat", { name: "New Chat" }, { headers: getAuthHeader() });

      if (data.success) {
        setChats((prev) => [...prev, data.chat]);
        setSelectedChat(data.chat); // ✅ immediately set selected chat
        return data.chat;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return null;
    }
  };

  // ✅ Fetch all chats and auto-select one
  const fetchUserChats = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: getAuthHeader(),
      });

      if (data.success) {
        setChats(data.chats);

        if (data.chats.length > 0) {
          setSelectedChat(data.chats[0]);
        } else {
          const newChat = await createNewChat();
          if (newChat) setSelectedChat(newChat);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Theme management
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✅ Fetch user on token change
  useEffect(() => {
    fetchUser();
  }, [token]);

  // ✅ Fetch chats only after user is loaded
  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        navigate,
        user,
        setUser,
        fetchUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        theme,
        setTheme,
        createNewChat,
        loadingUser,
        fetchUserChats,
        token,
        setToken,
        axios,
        getAuthHeader, // ✅ Exported
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);




