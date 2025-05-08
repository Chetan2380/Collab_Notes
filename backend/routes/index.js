import { Router } from "express";
import UserRoutes from "../routes/user.routes.js"
import NoteRoutes from "../routes/note.routes.js"

const router = Router();

router.use("/user", UserRoutes);
router.use("/notes", NoteRoutes);

export default router;