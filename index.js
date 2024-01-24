const express = require("express");
const app = express();
const dotenv = require("dotenv");
const dbConnect = require("./config/database");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const category = require("./routes/categoryRoute");
const utils = require("./routes/utilsRoute");
const checkout = require("./routes/checkoutRoute");
const cookie = require("cookie-parser");
const GoogleStrategy = require("./utils/Provider");
const passport = require("passport");
const session = require("express-session");
const { shipRocketAuth } = require("./utils/shipRocket");

const { origin } = require("./config/config");

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT || 4001;

//Configuration Cloud Platform
cloudinary.config({
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});

//Middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "20mb" }));
console.log(origin);
app.use(
  cors({
    credentials: true,
    origin: origin,
  })
);

GoogleStrategy();
app.use(cookie());
app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", category);
app.use("/api/v1", utils);

app.use("/api/v1", checkout);
//
dbConnect();

// shipRocketAuth();

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}\n Open It By Clicking http://localhost:${PORT}`
  );
});
