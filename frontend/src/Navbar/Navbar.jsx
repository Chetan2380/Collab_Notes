import React, { useState, useEffect, useRef, useContext } from "react";
import toast from "react-hot-toast";
import "./Navbar.css";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import Api from "../axiosconfig";
import { AuthContext } from "../context/user.context";

function Navbar() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const { state, dispatch } = useContext(AuthContext);

  useEffect(() => {
    if (!socket) return;

    socket.on("note-update", ({ content, sender }) => {
      const message = `Note updated by ${sender || "a collaborator"}`;
      setNotifications((prev) => [message, ...prev]);
      toast(message, { icon: "✏️" });
    });

    return () => {
      socket.off("note-update");
    };
  }, [socket]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
        const response = await Api.post("/user/logout");
        if (response.data.success) {
            dispatch({ type: "LOGOUT" });
            navigate("/login");
            toast.success(response.data.message);
        } else {
            toast.error("Logout failed.");
        }
    } catch (error) {
        toast.error("Failed to logout.");
    }
};

  return (
    <nav className="navbar">
      <div className="nav-title">Collaborative Notes</div>

      <div className="nav-tabs">
        <ul className="navbar-links">
          {/* <li onClick={() => navigate("/my-notes")}>My Notes</li>
          <li onClick={() => navigate("/shared-notes")}>Shared With Me</li>
          <li onClick={() => navigate("/create")}>Create Note</li> */}
          <li onClick={() => navigate("/")}>Dashboard</li>
        </ul>

        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className="notification-btn"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            🔔 Notifications ({notifications.length})
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <div className="notification-item">No new notifications</div>
              ) : (
                notifications.map((note, index) => (
                  <div key={index} className="notification-item">
                    {note}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <ul className="auth-links">
        {!state?.user ? (
    <li onClick={() => navigate("/login")}>Login</li>
  ) : (
    <li onClick={handleLogout}>Logout</li>
  )}
        </ul>
        
      </div>
    </nav>
  );
}

export default Navbar;
