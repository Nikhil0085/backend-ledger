const accountModel = require("../models/account.model");



async function createAccountController(req, res) {
    const user = req.user;

    console.log("this is test user >>>>>>>>>>", user._id);
    
  const account = await accountModel.create({
    userId: req.user._id,
  });
    res.status(201).json({
        account
    })
}
module.exports = {
    createAccountController
}