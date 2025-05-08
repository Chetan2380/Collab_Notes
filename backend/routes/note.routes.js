import { Router } from "express";
import { createNote, updateNote, shareNote, getAccessibleNotes, getMyNotes, deleteNote, getSharedNotes, updateSharedNote } from "../controllers/note.controller.js";
import { checkIsUserValid } from "../middlewares/user.middleware.js";

const router = Router();
router.use(checkIsUserValid);
router.post("/create", createNote);
router.put("/share/:noteId", shareNote);
router.get("/all", getAccessibleNotes);
router.post("/mynotes", getMyNotes);
router.put("/updatenotes/:id", updateNote);
router.post("/sharedwithme", getSharedNotes);
router.post("/sharednote/update", updateSharedNote);
router.delete("/deletenotes/:id", deleteNote);

export default router;
