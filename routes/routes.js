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
router.get("/home/:folderID/:fileID", requireAuth, remote.viewFile);
router.get("/home/view-all-folders", requireAuth, remote.viewAllFolders);

router.post("/addFolder", requireAuth, remote.addFolder);

router.post("/updateFileName", requireAuth, remote.postUpdatedFileName);
router.post("/softDeleteFile", requireAuth, remote.postDeleteFile);
router.post("/deleteFile", requireAuth, remote.postDeleteFile);

router.post("/updateFolderName", requireAuth, remote.postUpdateFolder);
router.post("/softDelete", requireAuth, remote.softDeleteFolder);
router.post("/deleteFolder", requireAuth, remote.postDeleteFolder);

router.get("/home/trash", requireAuth, remote.getTrash);

router.post("/newFolder", requireAuth, remote.addFolder);

module.exports = router;
