const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

async function createTransaction(req, res) {
  try {
    const {fromAccount, toAccount, amount, idempotencyKey } = req.body;

   

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "invalid accounts",
      });
    }

    const existingTransaction = await transactionModel.findOne({
      idempotencyKey,
    });

    if (existingTransaction) {
      return res.status(200).json({
        message: "transaction already exists",
        transaction: existingTransaction,
      });
    }

    if (
      fromUserAccount.status !== "active" ||
      toUserAccount.status !== "active"
    ) {
      return res.status(400).json({
        message: "both accounts must be active",
      });
    }

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: "insufficient balance",
      });
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: "invalid amount",
      });
    }

    const transaction = await transactionModel.create({
      fromAccount,
      toAccount,
      amount: parsedAmount,
      idempotencyKey,
      status: "PENDING",
    });

    await ledgerModel.create({
      account: fromAccount,
      amount: parsedAmount,
      transaction: transaction._id,
      type: "DEBIT",
    });

    await ledgerModel.create({
      account: toAccount,
      amount: parsedAmount,
      transaction: transaction._id,
      type: "CREDIT",
    });

    transaction.status = "COMPLETED"; 

    await transaction.save();

    return res.status(201).json({
      message: "transaction completed successfully",
      transaction,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message,
    });
  }
}

async function createInitialFundsTransaction(req, res) {
  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "toAccount, amount and idempotencyKey are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(toAccount)) {
      return res.status(400).json({
        message: "invalid toAccount id",
      });
    }

    const toUserAccount = await accountModel.findById(toAccount);

    if (!toUserAccount) {
      return res.status(400).json({
        message: "invalid account",
      });
    }

    const systemUserId = req.userId || (req.user && req.user._id);

    if (!systemUserId) {
      return res.status(400).json({
        message: "system user id not provided",
      });
    }

    const fromUserAccount = await accountModel.findOne({
      userId: systemUserId,
      status: "active",
    });
    
console.log(fromUserAccount);
console.log(toUserAccount);
    
    if (!fromUserAccount) {
      return res.status(400).json({
        message: "system user account is not found",
      });
    }

    const existing = await transactionModel.findOne({
      idempotencyKey,
    });

    if (existing) {
      return res.status(200).json({
        message: "transaction already exists",
        transaction: existing,
      });
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: "invalid amount",
      });
    }

    const transaction = await transactionModel.create({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount: parsedAmount,
      idempotencyKey,
      status: "PENDING",
    });

    await ledgerModel.create({
      account: fromUserAccount._id,
      amount: parsedAmount,
      transaction: transaction._id,
      type: "DEBIT",
    });

    await ledgerModel.create({
      account: toAccount,
      amount: parsedAmount,
      transaction: transaction._id,
      type: "CREDIT",
    });

    transaction.status = "COMPLETED";

    await transaction.save();

    return res.status(201).json({
      message: "initial funds transaction completed successfully",
      transaction,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message,
    });
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
