const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
    // console.log("cookies", req.cookies);
    // console.log("headers",req.headers)
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, invalid token",
    });
  }
}

module.exports = {
  authMiddleware,
};
