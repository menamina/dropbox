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
  try {
    const { folderID } = req.params;
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });

    const currentFolder = await prisma.folder.findFirst({
      where: { id: folderID, userId: req.user.id },
    });

    if (!currentFolder) {
      return res.redirect("/home", {
        folders: folders,
        currentFolder: null,
        files: [],
        emptyMessage: "The folder you are looking for does not exist.",
      });
    } else {
      const currentFiles = await prisma.file.findMany({
        where: { folderId: currentFolder.id },
      });

      return res.render("fullHomePage", {
        folders: folders,
        currentFolder: currentFolder,
        files: currentFiles,
        emptyMessage: null,
      });
    }
  } catch (err) {
    res.send(`controller error @ fullHomePage - msg: ${err.message}`);
  }
}

async function postUpdatedFileName(req, res) {
  try {
  } catch (error) {}
  res.send(`controller error @ postUpdatedFileName - msg: ${err.message}`);
}

async function postDeleteFile(req, res) {
  try {
  } catch (error) {}
  res.send(`controller error @ postDeleteFile - msg: ${err.message}`);
}

async function postUpdateFolder(req, res) {
  try {
  } catch (error) {}
  res.send(`controller error @ postUpdateFolder - msg: ${err.message}`);
}

async function postDeleteFolder(req, res) {
  try {
  } catch (error) {}
  res.send(`controller error @ postDeleteFolder - msg: ${err.message}`);
}

module.exports = {
  login,
  getSignUp,
  authSignUp,
  renderHome,
  fullHomePage,
  postUpdatedFileName,
  postDeleteFile,
  postUpdateFolder,
  postDeleteFolder,
};
