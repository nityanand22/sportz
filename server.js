import express from "express";
import { matchesRouter } from "./src/routes/matches.js";
import http from "http";
import { attachWebSocketServer } from "./src/ws/server.js";
import { securityMiddleware } from "./src/arcjet.js";
import { commentaryRouter } from "./src/routes/commentary.js";

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityMiddleware());

app.use("/matches", matchesRouter);
app.use("/matches/:id/commentary", commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary } =
  attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, () => {
  const baseurl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Server is running on ${baseurl}`);
  console.log(
    `WebSocket Server is running on ${baseurl.replace("http", "ws")}/ws`,
  );
});
