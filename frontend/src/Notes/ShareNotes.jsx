import React, { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import Api from "../axiosconfig";
import { AuthContext } from "../context/user.context";
import Navbar from "../Navbar/Navbar";

const socket = io("http://localhost:8000", {
  withCredentials: true,
});

const SharedWithMe = () => {
  const { state } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const fetchSharedNotes = async () => {
    setLoading(true);
    try {
      const response = await Api.post("/notes/sharedwithme", {
        userId: state?.user?.userId,
      });
      if (response.data.success) {
        setNotes(response.data.notes);
      } else {
        setMessage("Failed to fetch shared notes.");
      }
    } catch (error) {
      console.error("Error fetching shared notes:", error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      const response = await Api.post("/notes/sharednote/update", {
        noteId: editingNoteId,
        userId: state?.user?.userId,
        title: editTitle,
        content: editContent,
      });

      if (response.data.success) {
        alert("Note updated successfully.");
        cancelEditing();
        fetchSharedNotes(); 
      } else {
        alert(response.data.error || "Failed to update note.");
      }
    } catch (err) {
      console.error("Error updating shared note:", err);
      alert("Something went wrong.");
    }
  };

  const startEditing = (note) => {
    setEditingNoteId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditTitle("");
    setEditContent("");
  };

  const hasWritePermission = (note) =>
    note.sharedWith?.some(
      (entry) =>
        entry.user._id === state.user.userId && entry.permission === "write"
    );

  useEffect(() => {
    if (state?.user?.userId) {
      socket.emit("register", state.user.userId); 
      fetchSharedNotes();
    }
  }, [state]);

  useEffect(() => {
    socket.on("noteUpdated", ({ title, updatedBy }) => {
      setNotification(`"${title}" was updated by a collaborator.`);
      setTimeout(() => setNotification(""), 8000);
    });

    return () => {
      socket.off("noteUpdated");
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div className="shared-notes-container">
        <h2 className="section-title">Notes Shared With You</h2>
        {notification && <p className="notification">{notification}</p>}
        {message && <p className="message">{message}</p>}
        {loading ? (
          <div className="loader-container">
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
        ) : notes.length === 0 ? (
          <p>No notes have been shared with you yet.</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note._id} className="note-card">
                {editingNoteId === note._id ? (
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Edit Title"
                    />
                    <textarea
                      rows="4"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Edit Content"
                    />
                    <button onClick={saveChanges}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <h3>{note.title}</h3>
                    <p>{note.content.substring(0, 100)}...</p>
                    <p>
                      <b>Owner:</b> {note.createdBy?.name} ({note.createdBy?.email})
                    </p>
                    <p>
                      <b>Last Updated:</b>{" "}
                      {new Date(note.updatedAt).toLocaleString()}
                    </p>
                    {hasWritePermission(note) && (
                      <button onClick={() => startEditing(note)} className="edit-button">Edit</button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SharedWithMe;
