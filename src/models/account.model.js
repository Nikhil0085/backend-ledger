const mongoose = require("mongoose");
const ledger=require('./ledger.model');
const ledgerModel = require("./ledger.model");
const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required for creating an account"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "frozen"],
        message: "status should be either active, inactive or frozen",
      },
      default: "active",
    },
    currency: {
      type: String,
      required: [true, "currency is required for creating an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);
accountSchema.index({ userId:1, status:1})
accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] },
              "$amount",
              0
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: {$subtract:["$totalCredit","$totaldebit"]}
      }
    }
  ]);

  if (balanceData.length == 0) {
    return 0;
  }
  return  balanceData[0].balance
}

const accountModel = mongoose.model("Account", accountSchema);
module.exports = accountModel;
