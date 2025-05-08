import Note from "../models/note.model.js";
import User from "../models/user.model.js";

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body.noteData;

    if (!title || !content) {
      return res.json({ success: false, error: "All fields are required." });
    }

    const existingNote = await Note.findOne({ title: title, createdBy: req.userId });
    if (existingNote) {
      return res.json({
        success: false,
        error: "A note with this title already exists.",
      });
    }

    const newNote = new Note({
      title,
      content,
      createdBy: req.userId,
    });

    await newNote.save();

    return res.json({
      success: true,
      message: "Note created successfully.",
    });
  } catch (error) {
    console.log(error, "createNote error");
    return res.json({ success: false, error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
      const { id } = req.params;
      const { title, content } = req.body.noteData;

      if (!title || !content) {
          return res.json({ success: false, error: "Title and content are required." });
      }

      const updatedNote = await Note.findByIdAndUpdate(
          id,
          { title, content },
          { new: true }
      );

      if (!updatedNote) {
          return res.json({ success: false, error: "Note not found." });
      }

      return res.json({ success: true, message: "Note updated successfully.", note: updatedNote });
  } catch (error) {
      console.error("Error updating note:", error);
      return res.json({ success: false, error: "Something went wrong while updating the note." });
  }
};

export const shareNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { email, permission } = req.body;

    if (!email || !permission) {
      return res.json({ success: false, error: "Email and permission are required." });
    }

    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.json({ success: false, error: "User not found." });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.json({ success: false, error: "Note not found." });
    }

    const alreadyShared = note.sharedWith.find(
      (entry) => entry.user.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
      alreadyShared.permission = permission; 
    } else {
      note.sharedWith.push({ user: userToShare._id, permission });
    }

    await note.save();

    return res.json({ success: true, message: "Note shared successfully." });
  } catch (error) {
    console.error("Error sharing note:", error);
    return res.json({ success: false, error: "Something went wrong while sharing the note." });
  }
};

export const getAccessibleNotes = async (req, res) => {
  try {
    const userId = req.userId;
    const notes = await Note.find({
      $or: [
        { createdBy: userId },
        { 'collaborators.userId': userId }
      ]
    }).populate('createdBy collaborators.userId', 'name email');
    res.json({ success: true, notes });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export const getMyNotes = async (req, res) => {
  try {
    const { userId } = req.body;

    const notes = await Note.find({ createdBy: userId }).sort({ createdAt: -1 });

    return res.json({ success: true, notes });
  } catch (error) {
    console.log(error, "error");
    return res.json({ error: error, success: false });
  }
};

export const getSharedNotes = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required." });
    }

    const sharedNotes = await Note.find({
      "sharedWith.user": userId
    })
    .populate({ path: "createdBy", select: "name email", model: User })
    .populate({ path: "sharedWith.user", select: "name email", model: User });

    res.json({ success: true, notes: sharedNotes });
  } catch (error) {
    console.error("Error fetching shared notes:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};

export const updateSharedNote = async (req, res) => {
  try {
    const { noteId, userId, title, content } = req.body;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found." });
    }

    const sharedUser = note.sharedWith.find(
      (entry) => entry.user.toString() === userId
    );

    if (!sharedUser || sharedUser.permission !== "write") {
      return res.status(403).json({ success: false, error: "No write permission for this note." });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    note.lastUpdated = new Date();

    await note.save();

    const noteOwnerId = note.createdBy.toString();
    const socketId = req.onlineUsers.get(noteOwnerId);
    if (socketId) {
      req.io.to(socketId).emit("noteUpdated", {
        noteId: note._id,
        updatedBy: userId,
        title: note.title,
      });
    }

    res.json({ success: true, message: "Note updated successfully.", note });
  } catch (error) {
    console.error("Error updating shared note:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};



export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.json({ success: false, error: "Note not found." });
    }

    return res.json({ success: true, message: "Note deleted successfully." });
  } catch (error) {
    console.error("Delete note error:", error);
    return res.json({ success: false, error: "Server error while deleting note." });
  }
};

