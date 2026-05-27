const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

async function createTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

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
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
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

    await session.startTransaction();

    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING",
        },
      ],
      { session }
    );

    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session }
    );

    transaction.status = "COMPLETED";

    await transaction.save({ session });

   session.commitTransaction();

    return res.status(201).json({
      message: "transaction completed successfully",
      transaction,
    });

  } catch (err) {

    await session.abortTransaction();

    return res.status(500).json({
      message: err.message,
    });

  } finally {

    await session.endSession();
  }
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  const toUserAccount = await accountModel.findById(toAccount);

  if (!toUserAccount) {
    return res.status(400).json({
      message: "invalid account",
    });
  }
console.log("REQ USER:", req.user);
  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
    status: "ACTIVE",
  });
  console.log("FOUND ACCOUNT:", fromUserAccount);

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "system user account is not found",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    await transaction.save({ session });

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    transaction.status = "COMPLETED";

    await transaction.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "initial funds transaction completed successfully",
      transaction,
    });
  } catch (err) {
    await session.abortTransaction();

    return res.status(500).json({
      message: err.message,
    });
  } finally {
    await session.endSession();
  }
}
module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};