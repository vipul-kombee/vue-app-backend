import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "./Apis/User/user.model";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { IUser } from "./types";
import PaymentRoutes from './Apis/Payment/payment.route';

dotenv.config();
const app = express();

// Add body-parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS middleware
app.use(
  cors({
    origin: true, // Replace with your frontend domain, e.g., "http://localhost:3000"
    credentials: true, // Allows cookies to be sent
  })
);

//Add express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

//Initialize passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

//Passport local strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done: Function) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: IUser['_id'], done: Function) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.post("/refresh-session", (req, res) => {
  if (req.isAuthenticated()) {
    //regenerate session
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to refresh session",
        });
      }

      //Re-authenticate user
      req.login(req.user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Failed to re-authenticate" });
        }

        //Reset the maxAge of the cookie
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;

        return res.json({
          message: "Session refreshed successfully",
          expiresIn: req.session.cookie.maxAge,
        });
      });
    });
  } else {
    res.status(401).json({
      message: "User not authenticated",
    });
  }
});

import UserRoutes from "./Apis/User/user.route";
import ProductRoutes from "./Apis/Product/product.route";

// app.get("/health", (res: Response) => {
//   return res.status(200).json({
//     message: "Health is good",
//     date: new Date(),
//   });
// });

//to handle CORS error( implemented by web browsers to prevent web pages from making requests to a different domain)
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
//     return res.status(200).json({});
//   }
//   next();
// });

app.use("/user", UserRoutes);
app.use("/product", ProductRoutes);
app.use('/payment', PaymentRoutes);

mongoose.Promise = global.Promise;

//   mongodb+srv://niraveasternts:npn987654N@@cluster0.iexjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

mongoose
  .connect(process.env.MONGODB_URL as string)
  .then(() => {
    console.log("connect to DB");
  })
  .catch((e) => {
    console.log("not able to connect with DB");
    console.log(e);
  });

export default app;
