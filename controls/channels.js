const prisma = require("../prisma/client");
const passwordUtils = require("../utils/password");

function login(req, res) {
  res.render("login");
}

function getSignUp(req, res) {
  res.render("signup");
}

function authSignUp(req, res) {
  try {
    const { name, username, email, password, confirmPass } = req.body;
  } catch (err) {
    res.send(`controller error @ authSignUp - msg: ${err.message}`);
  }
}

module.exports = {
  login,
  getSignUp,
};
