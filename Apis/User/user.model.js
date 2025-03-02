const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["BUYER", "SELLER", "SUPERADMIN"],
    default: "BUYER",
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
  ],
  resetToken: {
    type: String,
  },
  resetTokenExpiration: {
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model("users", UserSchema);
