const { Router } = require("express");
const router = Router();
const remote = require("../controls/channels");
const validators = require("../utils/validators");

router.get("/", remote.login);
router.get("/sign-up", remote.getSignUp);

router.post("/", remote.authLogin);
router.post("/sign-up", validators, remote.authSignUp);

module.exports = router;
