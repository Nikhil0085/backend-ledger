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
async function getUserAccountController(req, res) {
  const accounts = await accountModel.find({ userId: req.user._id })
  console.log("userid",req.user._id )
  res.status(200).json({
    accounts
  })
}
async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    userId: req.user._id,
  });

  if (!account) {
    res.send(404).json({
      message: "account not found"
    

    })
  }
  const balance = await account.getBalance();
  res.status(200).json({
    accountId: account._id,
    balance:balance
  })

  
}
module.exports = {
  createAccountController,
  getUserAccountController,
  getAccountBalanceController
};
