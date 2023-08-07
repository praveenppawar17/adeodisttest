import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import Router from "./routes/route.js";
import pool from "./database/db.js";
import Logger from "./utils/logger.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// ths s logger instance
const logger = new Logger('./logs');

// Middleware to log user operations
app.use((req, res, next) => {
    const operationLog = `User performed ${req.method} ${req.originalUrl}`;
    logger.log(operationLog);
    next();
});
app.use("/api", Router);

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error connecting to the database:', err);
  }
  console.log('Database connected successfully');
  // releases the client back to the pool
  release();
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server is running successfully on PORT ${PORT}`)
);
