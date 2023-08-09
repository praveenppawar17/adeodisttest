import pool from "../database/db.js";

export const createFeedsDao = async ({ name, url, description }) => {
  try {
    //if the "feeds" table exists
    const tableExistsQuery = `
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_name = 'feeds'
            )
        `;

    const { rows: tableExistsResult } = await pool.query(tableExistsQuery);
    const tableExists = tableExistsResult[0].exists;

    // if the "feeds" table doesn't exist, create it
    if (!tableExists) {
      const createTableQuery = `
                CREATE TABLE feeds (
                    id SERIAL PRIMARY KEY,
                    name TEXT,
                    url TEXT,
                    description TEXT
                )
            `;
      await pool.query(createTableQuery);
    }

    const insertQuery = `
            INSERT INTO feeds (name, url, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

    const values = [name, url, description];
    const result = await pool.query(insertQuery, values);
    const insertedFeed = result.rows[0];

    return insertedFeed;
  } catch (error) {
    console.error("Error inserting feed:", error);
    res
      .status(500)
      .json({ error: "An error occurred while inserting the feed." });
  }
};

export const getAllFeedsDao = async () => {
  try {
    let feedsResponse = await pool.query(`select * from feeds`);
    return feedsResponse.rows;
  } catch (error) {
    return error;
  }
};

export const updateFeedsDao = async ({ id, description, url, name }) => {
  try {
    console.log('------- ', id, description, url, name);

    // Check if the feed with the given ID exists
    const checkQuery = `
      SELECT 1
      FROM feeds
      WHERE id = $1
    `;
    const checkValues = [id];
    const checkResponse = await pool.query(checkQuery, checkValues);

    if (checkResponse.rowCount === 0) {
      console.log('Feed not found for update');
      return 0; // Indicate that no rows were updated
    }

    // If the feed exists, proceed with the update
    const updateQuery = `
      UPDATE feeds
      SET description = $1, url = $2, name = $3
      WHERE id = $4
    `;

    const values = [description, url, name, id];
    const feedsResponse = await pool.query(updateQuery, values);
    console.log('feeds ..... ', feedsResponse);

    return feedsResponse.rowCount;
  } catch (error) {
    console.log('Error updating feed:', error);
    throw error;
  }
};

export const deleteFeedsDao = async (feedId, userId) => {
  try {
    // check if the user has permission_type_id = 4 - it is to delete
    const permissionCheckQuery = `
      SELECT 1
      FROM feed_access
      WHERE user_id = $1
        AND feed_id = $2
        AND permission_type_id = 4;
    `;
    const permissionCheckResponse = await pool.query(permissionCheckQuery, [
      userId,
      feedId,
    ]);
    console.log(
      "permissionCheckResponse.... ",
      permissionCheckResponse.rowCount
    );

    if (permissionCheckResponse.rowCount === 0) {
      return {
        isPermissionExist: false,
      };
    }

    // delete related records from feed_access table
    const deleteAccessQuery = `
  DELETE FROM feed_access
  WHERE feed_id = $1;
`;
    await pool.query(deleteAccessQuery, [feedId]);

    // user has the required permission, proceed with the delete operation
    const deleteQuery = `
  DELETE FROM feeds
  WHERE id = $1
`;
    const deleteResponse = await pool.query(deleteQuery, [feedId]);
    console.log("delte res for feeds.. ", deleteResponse);
    return deleteResponse;
  } catch (error) {
    console.error("Error deleting feed: ", error);
    throw error;
  }
};

export const getFeedByIdDao = async (feedId) => {
  try {
    const feedQery =
      "SELECT id, name, url, description FROM feeds WHERE id = $1";
    const { rows } = await pool.query(feedQery, [feedId]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    throw error;
  }
};

export const addFeedAccessDao = async ({ user_id, feed_id }) => {
  try {
    const feedAccessQuery = `
      INSERT INTO feed_access (user_id, feed_id)
      VALUES ($1, $2)
      RETURNING *`;
    const values = [user_id, feed_id];

    const { rows } = await pool.query(feedAccessQuery, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};
