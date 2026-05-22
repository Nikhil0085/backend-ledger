const mongoose = require("mongoose");
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
accountSchema.index({ user: 1, status: 1 });

const accountModel = mongoose.model("Account", accountSchema);
module.exports = accountModel;
