import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../Notes/CreateNote.css";
import Navbar from "../Navbar/Navbar";
import Api from "../axiosconfig";

const CreateNote = () => {
  const router = useNavigate();
  const [noteData, setNoteData] = useState({
    title: "",
    content: ""
  });

  const [errors, setErrors] = useState([]);

  function handleChange(event) {
    setNoteData({ ...noteData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (noteData.title && noteData.content) {
        const response = await Api.post("/notes/create", {noteData});
        if (response.data.success) {
          setNoteData({
            title: "",
            content: "",
          });
          toast.success(response.data.message || "Note created successfully");
          router("/");
        }
      } else {
        toast.error("All fields are mandatory.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create note.");
    }
  }

  return (
    <div className="create-note">
      <Navbar />
      <div className="create-note-container">
        <form className="create-note-form" onSubmit={handleSubmit}>
          <h1 className="create-note-heading">Create a New Note</h1>

          {errors.length > 0 && (
            <ul className="note-errors">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}

          <label className="note-label">Title:</label>
          <input
            className="note-input"
            type="text"
            name="title"
            value={noteData.title}
            onChange={handleChange}
            placeholder="Note Title"
          />

          <label className="note-label">Content:</label>
          <textarea
            className="note-textarea"
            name="content"
            value={noteData.content}
            onChange={handleChange}
            placeholder="Write your note here..."
          />

          <input
            className="note-submit"
            type="submit"
            value="Create"
          />
        </form>
      </div>
    </div>
  );
};

export default CreateNote;
