const transectionModel = require("../models/transection.model")
const ledgerModel= require("../models/ledger.model")
const accountModel = require("../models/account.model")
const mongoose = require("mongoose")



async function createTransection(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
       return res.status(400).json({
            message:"fromaccount to account amount idempotency key these are required"

        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })
    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })
    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message:"invalid fromAccount or toAccount"
        })
    
}
    const isTransectionAlreadyExists = await transectionModel.findOne({
        idempotencyKey: idempotencyKey
    })
    if (isTransectionAlreadyExists) {
        if (isTransectionAlreadyExists.status == "COMPLETED") {
              return res.status(200).json({
                message: "transection already processed",
                transection: isTransectionAlreadyExists,
              });
        }
        if (isTransectionAlreadyExists.status == "PENDING") {
             return res.status(202).json({
               message: "transection is still processing",
             });
        }
            if (isTransectionAlreadyExists.status == "FAILED") {
                  return res.satus(500).json({
                    message:
                      "transection processing failedpreviously,please retry",
                  });
            }

        if (isTransectionAlreadyExists.status == "REVERSED") {
          return  res.status(500).json({
                message: "transection was reversed please retry"
            })
        } 
        
    }
    //  check account status 
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {


        return res.send(400).json({
            message:"both fromaccount and to account must be active"
        })
    }

    // derive sender balance of ledger
    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
     return   res.status(400).json({
            message: `insufficient balance .current balance is ${balance}. requested amount is ${amount}`
        })
    }
        
    //  create transection 
    const session = await mongoose.startSession()
    session.startTransaction()

    const transection = await transectionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"

    }, { session })
    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transection._id,
        type:"DEBIT"
    }, { session })
    
       const creditLedgerEntry = await ledgerModel.create(
         {
           account: toAccount,
           amount: amount,
           transaction: transection._id,
           type: "DEBIT",
         },
         { session },
       );
    transection.status = "COMPLETED"
    await transection.save({session})
await session.commitTransaction()
    session.endSession();
    //  send email notification 
    


}
