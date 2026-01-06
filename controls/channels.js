// const prisma = require("../prisma/client");

function login(req, res) {
  res.render("login");
}

function getSignUp(req, res) {
  res.render("signup");
}

module.exports = {
  login,
  getSignUp,
};
