import http from 'http';
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import mongoose from "mongoose";
import AllRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://collaborative-notes-snowy.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
}); 

app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  cors({
    origin: "https://collaborative-notes-snowy.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: 'MYSECRETKEY',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: 'Lax' }, 
  })
);

app.get("/", (req, res) => {
  res.send("working.");
});

app.use("/api/v1", AllRoutes);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinNote", (noteId) => {
    socket.join(noteId);
  });

  socket.on("leaveNote", (noteId) => {
    socket.leave(noteId);
  });

  socket.on("updateNote", (data) => {
    io.to(data.noteId).emit("noteUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("DB connected.");
    server.listen(process.env.PORT_NUMBER, () => {
      console.log(`Server running on port ${process.env.PORT_NUMBER}`);
    });
  })
  .catch(console.error);
