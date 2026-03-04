import express from "express";
import { matchesRouter } from "./src/routes/matches.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/matches", matchesRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
