const { Router } = require("express");
const router = Router();
const remote = require("../controls/channels");
const validators = require("../utils/validators");
const passport = require("../config/passport");

router.get("/", remote.login);
router.get("/sign-up", remote.getSignUp);

router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.render("login", {
        emailErr: info.message === "incorrect email" ? info.message : null,
        passwordErr:
          info.message === "incorrect password" ? info.message : null,
      });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect("/home");
    });
  })(req, res, next);
});

router.post("/sign-up", validators, remote.authSignUp);

module.exports = router;
