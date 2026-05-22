dotenv = require('dotenv').config();
const express = require('express');
const authRoutes = require("./src/routes/auth.routes")
const accountRouter = require("./src/routes/account.routes")
const cookieParser = require("cookie-parser");
const connectDB = require("./src/db/db");
const app = express();
const port = 6000;

connectDB();
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api/accounts", accountRouter)



app.listen(port, () => {
    console.log("server is running on port "+ port)

})

