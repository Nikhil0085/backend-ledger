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
async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    console.log("DECODED:", decoded);

    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    
    if (!user.systemUser) {
      return res.status(403).json({
        message: "forbidden access not a system user",
      });
    }

    req.user = user;

    return next();
  } catch (err) {
    console.log(err);

    return res.status(401).json({
      message: "unauthorized access, token is invalid",
      error: err.message,
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware
};
