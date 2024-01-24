var GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/UserModal");
const sendToken = require("../utils/jwtToken");
const jwt = require("jsonwebtoken");

module.exports = (req, res) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser(profile);
          const token = generateToken(user);
          return done(null, { user, token });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));

  passport.deserializeUser((user, done) => done(null, user));
};

const findOrCreateUser = async (profile) => {
  let user =
    (await User.findOne({ googleId: profile.id })) ||
    (await User.findOne({ email: profile.emails[0].value }));

  if (!user) {
    user = new User({
      name: profile.displayName,
      googleId: profile.id,
      email: profile.emails[0].value,
    });
    await user.save();
  }

  return user;
};

// Function to generate a token
const generateToken = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  return token;
};
