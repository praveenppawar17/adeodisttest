import jwt from "jsonwebtoken";

export const accessToken = async (user) => {
  const tokenres = jwt.sign(
    { email: user.email, userId: user.userId, role: user.role },
    process.env.ACCESS_SECRET_KEY,
    { expiresIn: "15m" }
  );
  return tokenres;
};
