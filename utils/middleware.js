function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
}

function renderHomeIfAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/home");
  }
}

module.exports = { requireAuth, renderHomeIfAuth };
