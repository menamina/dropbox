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
    return res.redirect("/login");
  }
  try {
    let files = [];
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });

    if (folders.length > 0) {
      files = await prisma.file.findMany({
        where: { folderId: folders[0].id },
        orderBy: { createdAt: "asc" },
      });

      return res.redirect(`home/${folders[0].name}/${folders[0].id}`);
    } else {
      res.render("/home", {
        folders: [],
        currentFolder: null,
        files: [],
      });
    }
  } catch (err) {
    res.send(`controller error @ renderHome - msg: ${err.message}`);
  }
}

async function fullHomePage(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  try {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
    let files = [];
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });

    const { folderName, folderID } = req.params;

    const isFolder = await prisma.folder.findUnique({
      where: { id: folderID },
    });

    const currentFiles = await prisma.file.findMany({
      where: { folderId: folderID },
    });

    if (!currentFiles) {
      res.render("fullHomePage", {
        folders: folders,
        currentFolder: folderName,
        files: [],
      });
    }

    if (!isFolder) {
      res.render("fullHomePage", {
        folders: folders,
        currentFolder: [],
        files: currentFiles,
      });
    }

    files = currentFiles;

    res.render("fullHomePage", {
      folders: folders,
      currentFolder: folderName,
      files: currentFiles,
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
