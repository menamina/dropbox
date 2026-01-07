const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const prisma = require("../prisma/client");
const { verifyPass } = require("../utils/password");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          return done(null, false, { message: "incorrect email" });
        }

        const isMatch = await verifyPass(password, user.saltedHash);

        if (!isMatch) {
          return done(null, false, { message: "incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
