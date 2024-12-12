// config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models/User');


module.exports = (passport) => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'User',
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then(user => done(null, user))
      .catch(done);
  });
};
