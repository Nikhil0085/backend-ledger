const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
async function userRegisterController(req, res) {
  const { name, email, password } = req.body;
  const isUserExist = await userModel.findOne({
    email: email,
  });
  if (isUserExist) {
    return res.status(422).json({
      message: "user already exists",
      success: false,
    });
  }
  const user = await userModel.create({
    name,
    email,
    password,
  });

//   const account = accountModel.create({
//     userId: user._id,
//   });

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3d" },
  );
  res.cookie("token", token);
  res.status(201).json({
    message: "user created successfully",
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
      token,
      account
    
  });
  await emailService.sendRegistrationEmail(user.email, user.name);
}

async function userLoginController(req, res) {
  const { email, password } = req.body;
  const user = await userModel
    .findOne({
      email: email,
    })
    .select("+password");
  if (!user) {
    return res.status(404).json({
      message: "user not found",
      success: false,
    });
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "invalid password",
      success: false,
    });
  }
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3d" },
  );
  res.cookie("token", token);
  res.status(200).json({
    message: "user logged in successfully",
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
      token,
   
  });
}

module.exports = {
  userRegisterController,
  userLoginController,
};
