const mongoose = require('mongoose');
const bcrypt= require("bcryptjs")

const userSchema =new mongoose.Schema({
  name: {
    required: [true,"name is required for creating an account"],
    type: String,
  },
  email: {
    required:[true,"email is required"],
    type: [String, "email is required for creating a user"],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
      ],
    unique:[true,"email already exists"]
    
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password should be of 6 letters"],

    },
    systemUser: {
        type: Boolean,
        default: true,
        immutable: true,
        select:true
    }
},{
    timestamps:true
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return 
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return 
})
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;