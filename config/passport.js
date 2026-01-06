const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bycrpt = require("bycrypt");
const { PrismaClient } = require("@prisma/client");

passport.use(
  new LocalStratgey(async (username, password, done) => {
    try {
      const user = await Prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = 0;
      if (!match) {
        return done(null, false, { message: "incorrect password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.zerializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
