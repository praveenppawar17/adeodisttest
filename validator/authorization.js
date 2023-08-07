import jwt from "jsonwebtoken";
import { getUserByIdDao } from "../dao/userDao.js";
import { getPermissionsForRoleAndRoute } from "../utils/databaseUtils.js";

export const authorization = async (req, res, next) => {
  try {
    console.log("rew....", req.path);
    let route = "/" + req.path.split("/")[1];
    console.log("route.. ", route);
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) return res.status(401).json("Unauthorized user");
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    req.userId = decoded.userId;
    console.log("decoded... ", decoded);
    const user = await getUserByIdDao(decoded.userId);
    console.log("user... ", user);
    if (!user) return res.status(401).json("User not found");

    // gts permissions for the user role and  requestd rotes
    const permissions = await getPermissionsForRoleAndRoute(user.role, route);
    console.log("permision... ", permissions);
    // c if the user's role has permission for the requested route
    if (!permissions || permissions.length === 0) {
      return res
        .status(403)
        .json({ isSuccess: false, statusCode: 403, message: "Access denied" });
    }

    // user has permission for the requested route, proceed with next request
    next();
  } catch (error) {
    res
      .status(400)
      .json({ isSuccess: false, statusCode: 400, message: "Token not valid" });
  }
};
