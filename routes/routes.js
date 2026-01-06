const { Router } = require("express");
const router = Router();
const remote = require("../controls/channels");

router.get("/", remote.login);
router.get("/sign-up", remote.getSignUp);

router.post("/", remote.authLogin);
router.post("/sign-up", validators, remote.authSignUp);

module.exports = router;
