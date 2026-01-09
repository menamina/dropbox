const prisma = require("../prisma/client");
const { hashThisEnteredPassword } = require("../utils/password");

function login(req, res) {
  res.render("login", {
    emailErr: null,
    passwordErr: null,
  });
}

function getSignUp(req, res) {
  res.render("signup", {
    usernameTaken: null,
    emailInUse: null,
    passwordMisMatch: null,
  });
}

async function authSignUp(req, res) {
  try {
    const { name, username, email, password, confirmPass } = req.body;
    const usernameTaken = await prisma.user.findUnique({ where: { username } });
    const emailInUse = await prisma.user.findUnique({ where: { email } });
    const samePass = password === confirmPass;

    if (!usernameTaken && !emailInUse && samePass) {
      const hash = await hashThisEnteredPassword(password);
      await prisma.user.create({
        data: {
          name: name,
          username: username,
          email: email,
          saltedHash: hash,
        },
      });
      return res.render("login", {
        emailErr: null,
        passwordErr: null,
      });
    }
    if (usernameTaken) {
      return res.render("signup", {
        usernameTaken: `username is taken`,
        emailInUse: null,
        passwordMisMatch: null,
      });
    }
    if (emailInUse) {
      return res.render("signup", {
        emailInUse: `email is in use`,
        usernameTaken: null,
        passwordMisMatch: null,
      });
    }
    if (!samePass) {
      return res.render("signup", {
        usernameTaken: null,
        emailInUse: null,
        passwordMisMatch: `passwords are not the same`,
      });
    }
  } catch (err) {
    res.send(`controller error @ authSignUp - msg: ${err.message}`);
  }
}

async function renderHome(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect("login");
  }
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });

    if (folders.length === 0) {
      return res.render("home", {
        folders: [],
        currentFolder: null,
        files: [],
        emptyMessage: "No folders yet. Create one to get started.",
      });
    } else {
      return res.redirect(`/home/${folders[0].id}`);
    }
  } catch (err) {
    res.send(`controller error @ renderHome - msg: ${err.message}`);
  }
}

async function fullHomePage(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect("login");
  }

  try {
    const { folderID } = req.params;
    let files = [];
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });

    const currentFolder = await prisma.folder.findFirst({
      where: { id: folderID, userId: req.user.id },
    });

    const currentFiles = await prisma.file.findMany({
      where: { folderId: currentFolder.id },
    });

    files = currentFiles;

    if (!currentFolder) {
      res.redirect("home");
    }

    res.render("fullHomePage", {
      folders: folders,
      currentFolder: currentFolder,
      files: currentFiles,
      emptyMessage: null,
    });
  } catch (err) {
    res.send(`controller error @ fullHomePage - msg: ${err.message}`);
  }
}

module.exports = {
  login,
  getSignUp,
  authSignUp,
  renderHome,
  fullHomePage,
};
