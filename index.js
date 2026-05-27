dotenv = require('dotenv').config();
const express = require('express');



const cookieParser = require("cookie-parser");
const connectDB = require("./src/db/db");
const app = express();
const port = 6000;

connectDB();
app.use(cookieParser());
app.use(express.json());
const authRoutes = require("./src/routes/auth.routes");
const accountRouter = require("./src/routes/account.routes");
const transactionRoutes = require("./src/routes/transaction.model");

app.use("/api/auth", authRoutes)
app.use("/api/accounts", accountRouter)
app.use("/api/transaction", transactionRoutes);




app.listen(port, () => {
    console.log("server is running on port "+ port)

})

