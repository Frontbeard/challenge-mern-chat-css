import express from "express";
import morgan from "morgan";
import { Server as Socketserver } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import router from "./routes/message.js";

const url =
  "mongodb+srv://Frontbeard:Fordfalcon1$@cluster0.ruuahj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.Promise = global.Promise;

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", router);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.info(`Servidor ejecutándose en http://localhost:${PORT}`);
});

const io = new Socketserver(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.error("hola")
  console.info(socket.id);
  console.info("Cliente conectado");

  socket.on("message", (message, nickname) => {
    socket.broadcast.emit("message", {
      body: message,
      from: nickname,
    });
  });

  socket.on("typing", (data) => {
    const { isTyping, user } = data;
    socket.broadcast.emit("typing", { isTyping, user });
  });
});

mongoose
  .connect(url)
  .then(() => {
    console.info("Conectado con éxito a la base de datos");
  })
  .catch((error) => {
    console.error("Error conectando a la base de datos:", error);
  });

export default app;