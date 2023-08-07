import bcrypt from "bcrypt";
import pool from "../database/db.js";
import { SUPER_ADMIN } from "../constants.js";

export const signupUserDao = async (userDetails) => {
  try {
    console.log("user details... ", userDetails);
    // begins transaction here
    await pool.query("BEGIN");

    // Create the "users" table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(20) NOT NULL
      )
    `;
    await pool.query(createTableQuery);

    // checks if the user  exists already
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(userQuery, [userDetails.email]);
    console.log("rows... ", rows);
    if (rows.length === 0) {
      if (userDetails.role == SUPER_ADMIN) {
        // see if a super admin already exists
        const superAdminQuery =
          "SELECT * FROM users WHERE role = 'super_admin'";
        const superAdminRows = await pool.query(superAdminQuery);

        if (superAdminRows.rows.length > 0) {
          await pool.query("ROLLBACK");
          return {
            error: "A super admin already exists.",
          };
        }
      }

      const insertQuery =
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [
        userDetails.name,
        userDetails.email,
        userDetails.password,
        userDetails.role,
      ];

      const userResponse = await pool.query(insertQuery, values);

      // comit the trasaction her...
      await pool.query("COMMIT");

      return userResponse.rows[0];
    } else {
      await pool.query("ROLLBACK");

      return {
        isUserExists: true,
        email: rows[0].email,
      };
    }
  } catch (error) {
    console.log("er... ", error);
    await pool.query("ROLLBACK");
    throw error;
  }
};

export const loginUserDao = async (userDetails) => {
  try {
    console.log("user... ", userDetails);
    let userQuery = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(userQuery, [userDetails.email]);

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    let match = await bcrypt.compare(userDetails.password, user.password);

    if (match) {
      return { user, match: true };
    } else {
      return { userExists: true, match: false };
    }
  } catch (error) {
    throw error;
  }
};

export const createUserDao = async (userDetails) => {
  try {
    console.log("user details... ", userDetails);
    await pool.query("BEGIN");

    // create the users table if not exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(20) NOT NULL
      )
    `;
    await pool.query(createTableQuery);

    // c if the user already exists
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(userQuery, [userDetails.email]);

    if (rows.length === 0) {
      const insertQuery =
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [
        userDetails.name,
        userDetails.email,
        userDetails.password,
        userDetails.role,
      ];

      const userResponse = await pool.query(insertQuery, values);

      await pool.query("COMMIT");

      return userResponse.rows[0];
    } else {
      await pool.query("ROLLBACK");

      return {
        isUserExists: true,
        email: rows[0].email,
      };
    }
  } catch (error) {
    console.log("er... ", error);
    await pool.query("ROLLBACK");
    throw error;
  }
};
export const deleteUserByIdDao = async (userId) => {
  try {
    await pool.query("BEGIN");

    // delete records from feed_access table where user_id matches
    const deleteFeedAccessQuery = `
      DELETE FROM feed_access
      WHERE user_id = $1
    `;
    await pool.query(deleteFeedAccessQuery, [userId]);

    //  delete the user from the users table
    const deleteUserQuery = `
      DELETE FROM users
      WHERE id = $1
    `;

    const deleteResponse = await pool.query(deleteUserQuery, [userId]);

    await pool.query("COMMIT");

    return deleteResponse;
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error deleting user: ", error);
    throw error;
  }
};

export const getUserByIdDao = async (userId) => {
  try {
    const userQuery = "SELECT id, name, email, role FROM users WHERE id = $1";
    const { rows } = await pool.query(userQuery, [userId]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    throw error;
  }
};

export const assignPermissionDao = async ({
  user_id,
  feed_id,
  permission_type_id,
}) => {
  try {
    const feedAccessQuery = `
      INSERT INTO feed_access (user_id, feed_id, permission_type_id)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const values = [user_id, feed_id, permission_type_id];

    const { rows } = await pool.query(feedAccessQuery, values);
    console.log("rows... ", rows);
    return rows[0];
  } catch (error) {
    console.log("er... ", error);
    throw new Error("Database error while assigning permission");
  }
};
