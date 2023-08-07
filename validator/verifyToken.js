import jwt from "jsonwebtoken";
import { getUserByIdDao } from "../dao/userDao.js";

export const authentication = async (request, response, next) => {
  try {
    const token = request.headers["authorization"].split(" ")[1];
    if (!token) return response.status(401).json("Unauthorize user");
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    // console.log('tokem..... ', decoded)
    const user = await getUserByIdDao(decoded.userId);
    // console.log('user.. ', user)
    if (!user) return response.status(401).json("User not found");

    // compare rles from decoded and user response
    if (user.role !== decoded.role) {
      return response.status(403).json("Access denied");
    }

    request.user = decoded;
    next();
  } catch (error) {
    response.status(400).json("Token not valid");
  }
};
