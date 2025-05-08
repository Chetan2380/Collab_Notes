import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Api from "../axiosconfig";
import toast from "react-hot-toast";
import io from "socket.io-client";
import Navbar from "../Navbar/Navbar";
import { AuthContext } from "../context/user.context";
import "./NoteEditor.css";

const socket = io("http://localhost:8000"); 

const NoteEditor = () => {
  const { id } = useParams();
  const { state } = useContext(AuthContext);
  const [note, setNote] = useState(null);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (!id) return;
    socket.emit("joinNote", id);
    fetchNote();
    socket.on("noteUpdated", (updatedNote) => {
      if (updatedNote._id === id && updatedNote.updatedBy !== state.user.userId) {
        toast.success("Note updated by collaborator");
        setNote(updatedNote);
      }
    });

    return () => {
      socket.emit("leaveNote", id);
      socket.off("noteUpdated");
    };
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await Api.get(`/notes/getnote/${id}`);
      if (res.data.success) {
        setNote(res.data.note);
        setIsShared(res.data.note.sharedWith.length > 0);
      } else {
        toast.error("Failed to fetch note");
      }
    } catch (err) {
      toast.error("Error loading note");
    }
  };

  const handleChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await Api.put(`/notes/updatenotes/${id}`, {
        noteData: {
          title: note.title,
          content: note.content
        },
        updatedBy: state.user.userId
      });

      if (res.data.success) {
        toast.success("Note saved");
        socket.emit("updateNote", res.data.updatedNote);
      } else {
        toast.error("Save failed");
      }
    } catch (err) {
      toast.error("Error saving note");
    }
  };

  if (!note) return <div>Loading note...</div>;

  return (
    <div className="note-editor">
      <Navbar />
      <div className="editor-container">
        <div className="editor-header">
          <h2>Edit Note</h2>
          {isShared && <span className="shared-indicator">Shared Note</span>}
        </div>
        <input
          className="editor-input"
          type="text"
          name="title"
          value={note.title}
          onChange={handleChange}
        />
        <textarea
          className="editor-textarea"
          name="content"
          value={note.content}
          onChange={handleChange}
        />
        <button className="editor-save" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default NoteEditor;
