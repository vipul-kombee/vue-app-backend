const User = require("./user.model");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const bcrypt = require('bcryptjs');


exports.register = async (req, res) => {
  try {
    if (!this.validateEmail(req.body.email)) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    } else {
      const users = await User.find({ email: req.body.email }).exec();

      if (users.length != 0) {
        return res.status(409).json({
          message: "already user exist with this email",
        });
      }
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          email: req.body.email,
          password: hashedPassword,
          type: req.body.type,
        });

        try {
          const response = await user.save();
          return res.status(201).json({
            message: "User created successfully!",
            response,
          });
        } catch (error) {
          res.status(500).json({
            message: "Error in User creation",
            error,
          });
        }
      } catch (error) {
        return res.status(500).json({
          error,
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Error in finding user",
    });
  }
};

exports.validateEmail = function (email) {
  let re = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
  return !!re.test(email);
};

exports.login = async (req, res) => {
    try{
       const user = await User.findOne({ email: req.body.email }).exec();

       if(!user){
        return res.status(401).json({
            message: "Authentication failed: User not found"
        })
       }

       const result = await bcrypt.compare(req.body.password, user.password)

       if(result){
        let secret = "27676ghgtysj";
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                type: user.type
            },
            secret
        );

        return res.status(200).json({
            message: "Login Successfull!",
            token: token,
            type: user.type
        })
       } else {
        return res.status(401).json({
            message: "InValid Credentials!"
        })
       }
    } catch(error){
        return res.status(500).json({
            message: "Error in login user",
            error
        })
    }
}
