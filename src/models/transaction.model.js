const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Transaction must me associated with a from acount"],
        index: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account", 
        required: [true, "Transaction must me associated with a to account"],
        index: true,
    },
    status:{
        type: String,
        enum: {
          values:   ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        message: "status can be either pending completed failed or reversed"
        },
          default:"PENDING"
    },
    amount: {
        type: Number,
        required: [true, "amount is required to creating a transection"],
        min:[0,"transaction ammount cannot be negative"]
        
    },
    idempotencyKey: {
        type: String,
        required: [true, "idempotency key is required to create an account"],
        index: true,
        unique:true
    }
  
},{
    timestamps:true
})
const transactionModel = mongoose.model("transaction", transactionSchema)
module.exports=transactionModel
