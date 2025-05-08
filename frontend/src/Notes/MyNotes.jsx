import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./MyNotes.css";
import { AuthContext } from '../context/user.context';
import Api from "../axiosconfig";
import toast from "react-hot-toast";

const ShareNoteModal = ({ noteId, onClose }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");

  const handleShare = async () => {
    try {
      const res = await Api.put(`/notes/share/${noteId}`, { email, permission });
      if (res.data.success) {
        toast.success(res.data.message);
        onClose();
      } else {
        toast.error(res.data.error);
      }
    } catch (err) {
      toast.error("Something went wrong while sharing.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Share Note</h2>
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select value={permission} onChange={(e) => setPermission(e.target.value)}>
          <option value="read">Read</option>
          <option value="write">Write</option>
        </select>
        <div className="modal-actions">
          <button onClick={handleShare}>Share</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const MyNotes = () => {
  const { state } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: ""
  });
  const [shareModalNoteId, setShareModalNoteId] = useState(null);
  const router = useNavigate();

  const fetchMyNotes = async () => {
    setLoading(true);
    try {
      const response = await Api.post("/notes/mynotes", {
        userId: state?.user?.userId,
      });
      if (response.data.success) {
        setNotes(response.data.notes);
      } else {
        setMessage("Failed to fetch notes.");
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const response = await Api.delete(`/notes/deletenotes/${noteId}`);
      if (response.data.success) {
        toast.success("Note deleted successfully.");
        fetchMyNotes();
      } else {
        toast.error("Failed to delete note.");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("An error occurred while deleting the note.");
    }
  };

  const handleEdit = (note) => {
    setNoteToEdit(note._id);
    setEditFormData({
      title: note.title,
      content: note.content
    });
  };

  const handleInputChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const response = await Api.put(`/notes/updatenotes/${noteToEdit}`, {
        noteData: editFormData,
      });
      if (response.data.success) {
        toast.success("Note updated successfully.");
        setNoteToEdit(null);
        setEditFormData({ title: "", content: "" });
        fetchMyNotes();
      } else {
        toast.error("Failed to update note.");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("An error occurred while updating.");
    }
  };

  const userInitial = state?.user?.name?.charAt(0).toUpperCase();

  useEffect(() => {
    if (state?.user?.userId) {
      fetchMyNotes();
    }
  }, [state]);

  return (
    <div>
      <Navbar />
      <div className="my-notes-container">
        <div className="user-box">
          <div className="profile-letter">{userInitial}</div>
          <h1 className="user-name">{state?.user?.name}</h1>
          <p className="user-email">{state?.user?.email}</p>
        </div>

        <h2 className="section-title">Your Notes</h2>
        {message && <p className="message">{message}</p>}

        {loading ? (
          <div className="loader-container">
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
        ) : notes.length === 0 ? (
          <p>You have no notes yet.</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note._id} className="note-card">
                <h3>{note.title}</h3>
                <p>{note.content.substring(0, 100)}...</p>
                <div className="note-actions">
                  <button className="edit-btn" onClick={() => handleEdit(note)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(note._id)}>Delete</button>
                  <button className="share-btn" onClick={() => setShareModalNoteId(note._id)}>Share</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {noteToEdit && (
          <div className="edit-form">
            <h2>Edit Note</h2>
            <input
              type="text"
              name="title"
              value={editFormData.title}
              onChange={handleInputChange}
              placeholder="Title"
            />
            <textarea
              name="content"
              value={editFormData.content}
              onChange={handleInputChange}
              placeholder="Content"
            />
            <button onClick={handleUpdate}>Update Note</button>
            <button onClick={() => setNoteToEdit(null)}>Cancel</button>
          </div>
        )}

        {shareModalNoteId && (
          <ShareNoteModal
            noteId={shareModalNoteId}
            onClose={() => setShareModalNoteId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MyNotes;
