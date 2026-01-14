function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  } else {
    next();
  }
}

function renderHomeIfAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  } else {
    next();
  }
}

module.exports = { requireAuth, renderHomeIfAuth };
