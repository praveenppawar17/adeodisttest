import jwt from "jsonwebtoken";
import pool from "../database/db.js";

export const checkFeedAccess = async (req, res, next) => {
  try {
    const feedId = req.params.feedId;
    console.log('feedid... ', feedId)
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) return res.status(401).json("Unauthorized user");
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    console.log("decoded... ", decoded);

    // c if the user has access to the specified feed
    const accessQuery = `
      SELECT 1
      FROM feed_access fa
      WHERE fa.user_id = $1 AND fa.feed_id = $2
    `;
    console.log('id,,, ', feedId, decoded.userId)
    const { rowCount } = await pool.query(accessQuery, [decoded.userId, feedId]);
    console.log('orw.. ', rowCount)
    if (rowCount === 0) {
      return res.status(403).json("Access denied");
    }

    next();
  } catch (error) {
    console.log('er.. ', error)
    res.status(500).json("Internal server error");
  }
};
