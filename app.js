const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./Apis/User/user.model");
require("dotenv").config();
app.use(express.json());
const mongoose = require("mongoose");

//Add express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const UserRoutes = require("./Apis/User/user.route");
const ProductRoutes = require("./Apis/Product/product.route");

app.get("/health", (req, res, next) => {
  return res.status(200).json({
    message: "Health is good",
    date: new Date(),
  });
});

//to handle CORS error( implemented by web browsers to prevent web pages from making requests to a different domain)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/user", UserRoutes);
app.use("/product", ProductRoutes);

mongoose.Promise = global.Promise;

//   mongodb+srv://niraveasternts:npn987654N@@cluster0.iexjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("connect to DB");
  })
  .catch((e) => {
    console.log("not able to connect with DB");
    console.log(e);
  });

module.exports = app;
