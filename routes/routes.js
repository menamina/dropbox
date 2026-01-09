const { Router } = require("express");
const router = Router();
const remote = require("../controls/channels");
const passport = require("../config/passport");
const { signUpValidator } = require("../utils/validators");
const { requireAuth } = require("../utils/middleware");

router.get("/", remote.login);
router.get("/sign-up", remote.getSignUp);

router.post("/sign-up", signUpValidator, remote.authSignUp);

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

router.get("/home", requireAuth, remote.renderHome);

router.get("/home/:folderID", requireAuth, remote.fullHomePage);
router.get("/home//:folderID/:fileID", requireAuth);
router.get("/home/view-all-folders", requireAuth);

router.post("/");
router.post("/updateFileName", requireAuth, router.postUpdatedFileName);
router.post("/deleteFile", requireAuth, remote.postDelete);

router.post("/updateFolder", requireAuth, remote.postUpdateFolder);
router.post("/deleteFolder", requireAuth, remote.postDeleteFolder);

module.exports = router;
