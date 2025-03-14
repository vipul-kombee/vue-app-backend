import User from './user.model';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import sendResetPasswordEmail from '../../utils/emailService';
import { Request, Response, NextFunction } from 'express';

// exports.register = async (req, res) => {
//   try {
//     if (!this.validateEmail(req.body.email)) {
//       return res.status(400).json({
//         message: "Invalid Email",
//       });
//     } else {
//       const users = await User.find({ email: req.body.email }).exec();

//       if (users.length != 0) {
//         return res.status(409).json({
//           message: "already user exist with this email",
//         });
//       }
//       try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const user = new User({
//           email: req.body.email,
//           password: hashedPassword,
//           type: req.body.type,
//         });

//         try {
//           const response = await user.save();
//           return res.status(201).json({
//             message: "User created successfully!",
//             response,
//           });
//         } catch (error) {
//           res.status(500).json({
//             message: "Error in User creation",
//             error,
//           });
//         }
//       } catch (error) {
//         return res.status(500).json({
//           error,
//         });
//       }
//     }
//   } catch (error) {
//     res.status(500).json({
//       error: error,
//       message: "Error in finding user",
//     });
//   }
// };

const validateEmail = (email: string) => {
  let re = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
  return !!re.test(email);
};

// exports.login = async (req, res) => {
//     try{
//        const user = await User.findOne({ email: req.body.email }).exec();

//        if(!user){
//         return res.status(401).json({
//             message: "Authentication failed: User not found"
//         })
//        }

//        const result = await bcrypt.compare(req.body.password, user.password)

//        if(result){
//         let secret = "27676ghgtysj";
//         const token = jwt.sign(
//             {
//                 _id: user._id,
//                 email: user.email,
//                 type: user.type
//             },
//             secret
//         );

//         return res.status(200).json({
//             message: "Login Successfull!",
//             token: token,
//             type: user.type
//         })
//        } else {
//         return res.status(401).json({
//             message: "InValid Credentials!"
//         })
//        }
//     } catch(error){
//         return res.status(500).json({
//             message: "Error in login user",
//             error
//         })
//     }
// }

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      type: req.body.type,
    });

    const savedUser = await user.save();

    req.login(savedUser, (err) => {
      if (err) {
        return res.status(500).json({
          message: "Error logging in after registration",
          error: err.message,
        });
      }
      return res.status(201).json({
        message: "User created and logged in successfully!",
        user: {
          _id: savedUser._id,
          email: savedUser.email,
          type: savedUser.type,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in user registration",
      error: (error as Error).message,
    });
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: Error | null, user: any, info: { message: string }) => {
    if (err) {
      return res.status(500).json({
        message: "Error in login user",
        error: err,
      });
    }
    if (!user) {
      return res.status(401).json({
        message: info.message || "Login failed",
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          message: "Error in login user",
          error: err,
        });
      }
      return res.status(200).json({
        message: "Login Successful!",
        user: {
          _id: user._id,
          email: user.email,
          type: user.type,
          data: info,
        },
      });
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        message: "Error logging out",
        error: err,
      });
    }
    res.status(200).json({
      message: "Logged out successfully",
    });
  });
};

// Request password reset
export const forgotPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    // Generate random reset token
    const resetToken = require('crypto').randomBytes(32).toString("hex");

    // Save token and expiry to user doc
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    //Send reset email
    const emailSent = await sendResetPasswordEmail(email, resetToken);

    if (emailSent) {
      res.json({
        message: "Password reset email sent successfully",
      });
    } else {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500).json({ message: "Failed to send reset email" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset password with token
export const resetPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
      });
    }

    //Fix: Change getSalt to genSalt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    //Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
