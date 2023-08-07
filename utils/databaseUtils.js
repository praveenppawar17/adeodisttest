import pool from "../database/db.js";

export const getPermissionsForRoleAndRoute = async (roleName, routeName) => {
  try {
    const query = `
      SELECT pc.route_id
      FROM permissions pc
      JOIN roles r ON pc.role_id = r.id
      JOIN routes rt ON pc.route_id = rt.id
      WHERE r.id = $1 AND rt.path = $2;
    `;
    console.log("..... ", roleName, routeName);
    const { rows } = await pool.query(query, [roleName, routeName]);
    console.log('rows// ', rows)
    return rows.map((row) => row.route_id);
  } catch (error) {
    console.log('er.... ', error)
    throw error;
  }
};
