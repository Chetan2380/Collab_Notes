import React from "react";
import { useNavigate } from "react-router-dom";
import "../Notes/Dashboard.css";
import Navbar from "../Navbar/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
    <Navbar/>
      <div className="tabs">
        <button className="tab-btn" onClick={() => navigate("my-notes")}>
          My Notes
        </button>
        <button className="tab-btn" onClick={() => navigate("shared-notes")}>
          Shared With Me
        </button>
        <button className="tab-btn" onClick={() => navigate("create")}>
          Create Note
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
