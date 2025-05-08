// models/note.model.js
import mongoose, { Schema, model } from "mongoose";

const collaboratorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  permission: { type: String, enum: ['read', 'write'], required: true }
}, { _id: false });

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permission: { type: String, enum: ["read", "write"], default: "read" },
    },
  ],
  collaborators: [collaboratorSchema],
  lastUpdated: { type: Date, default: Date.now }
},
{ timestamps: true });

const Note = model("Notes", noteSchema);
export default Note;
