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
    errors: null,
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
        errors: null,
      });
    }
    if (emailInUse) {
      return res.render("signup", {
        emailInUse: `email is in use`,
        usernameTaken: null,
        passwordMisMatch: null,
        errors: null,
      });
    }
    if (!samePass) {
      return res.render("signup", {
        usernameTaken: null,
        emailInUse: null,
        passwordMisMatch: `passwords are not the same`,
        errors: null,
      });
    }
  } catch (err) {
    res.send(`controller error @ authSignUp - msg: ${err.message}`);
  }
}

async function renderHome(req, res) {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id, trashed: false },
      orderBy: { createdAt: "asc" },
    });

    if (folders.length === 0) {
      return res.render("home", {
        view: "empty",
        name: req.user.name,
        folders: [],
        currentFolder: [],
        files: [],
        file: null,
        emptyMessage: "No folders yet. Create one to get started.",
        trashedFiles: null,
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
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id, trashed: false },
      orderBy: { createdAt: "asc" },
    });

    const { folderID } = req.params;
    const numberParam = Number(folderID);
    if (Number.isNaN(numberParam)) {
      return res.redirect("/home");
    }

    const currentFolder = await prisma.folder.findFirst({
      where: { userId: req.user.id, id: numberParam, trashed: false },
    });

    if (!currentFolder) {
      return res.render("home", {
        view: "empty",
        name: req.user.name,
        folders: folders,
        currentFolder: null,
        files: [],
        file: null,
        emptyMessage: "No folder(s) found.",
        trashedFiles: null,
      });
    } else {
      const currentFiles = await prisma.file.findMany({
        where: { folderId: currentFolder.id },
      });

      return res.render("home", {
        view: "folder",
        name: req.user.name,
        folders: folders,
        currentFolder: currentFolder,
        files: currentFiles ? currentFiles : null,
        file: null,
        emptyMessage: null,
        trashedFiles: null,
      });
    }
  } catch (err) {
    res.send(`controller error @ fullHomePage - msg: ${err.message}`);
  }
}

async function postUpdatedFileName(req, res) {
  try {
    const { fileID, newFileName, folderID } = req.body;
    const fileIdNum = Number(fileID);
    const findFile = await prisma.file.findUnique({
      where: { id: fileIdNum, userId: req.user.id },
    });

    if (findFile) {
      await prisma.file.update({
        where: { id: fileIdNum, userId: req.user.id },
        data: {
          name: newFileName,
        },
      });
      return res.redirect(`/home/${folderID}`);
    }
  } catch (error) {
    res.send(`controller error @ postUpdatedFileName - msg: ${err.message}`);
  }
}

async function postUpdateFolder(req, res) {
  try {
    const { folderID, newFolderName, redirectTo } = req.body;
    const foundFolder = await prisma.folder.findUnique({
      where: { id: Number(folderID), userId: req.user.id, trashed: false },
    });
    if (foundFolder) {
      await prisma.folder.update({
        where: { id: Number(folderID), userId: req.user.id },
        data: {
          name: newFolderName,
        },
      });
      const redirectTarget =
        redirectTo === "view-all-folders"
          ? "/home/view-all-folders"
          : `/home/${folderID}`;
      return res.redirect(redirectTarget);
    }
    return res.redirect("/home");
  } catch (error) {
    res.send(`controller error @ postUpdateFolder - msg: ${err.message}`);
  }
}

async function postDeleteFile(req, res) {
  try {
    const { deleteThisFile } = req.body;
    const fileID = Number(deleteThisFile);
    const file = await prisma.file.findUnique({
      where: { id: fileID, userId: req.user.id },
      select: { id: true, folderId: true },
    });

    if (file) {
      await prisma.file.delete({
        where: { id: fileID, userId: req.user.id },
      });
      return res.redirect(`/home/trash`);
    }
  } catch (error) {
    res.send(`controller error @ postDeleteFile - msg: ${err.message}`);
  }
}

async function viewAllFolders(req, res) {
  try {
    const allFolders = await prisma.folder.findMany({
      where: { userId: req.user.id, trashed: false },
    });
    res.render("home", {
      view: "all folders",
      name: req.user.name,
      folders: allFolders,
      files: [],
      currentFolder: null,
      emptyMessage: null,
      trashedFiles: null,
    });
  } catch (error) {
    res.send(`controller error @ viewAllFolders - msg: ${err.message}`);
  }
}

async function viewFile(req, res) {
  try {
    const { folderID, fileID } = req.params;
    const findFile = await prisma.file.findUnique({
      where: { id: fileID, userId: req.user.id },
    });

    res.render("home", {
      view: "file",
      name: req.user.name,
      folders: [],
      files: [],
      file: findFile,
      currentFolder: null,
      emptyMessage: null,
      trashedFiles: null,
    });
  } catch (error) {
    res.send(`controller error @ viewFile - msg: ${err.message}`);
  }
}

async function getTrash(req, res) {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id, trashed: false },
      orderBy: { createdAt: "asc" },
    });

    const trashedFiles = await prisma.file.findMany({
      where: { userId: req.user.id, trashed: true },
    });

    const trashedFolders = await prisma.folder.findMany({
      where: { userId: req.user.id, trashed: true },
      orderBy: { createdAt: "asc" },
    });

    const noTrashedFiles = trashedFiles.length === 0;
    const noTrashedFolders = trashedFolders.length === 0;

    res.render("home", {
      view: "trash",
      name: req.user.name,
      folders: folders,
      files: [],
      file: [],
      currentFolder: null,
      emptyMessage:
        noTrashedFiles && noTrashedFolders ? "Nothing to see here" : null,
      trashedFiles,
      trashedFolders,
    });
  } catch (error) {
    res.send(`controller error @ getTrash - msg: ${err.message}`);
  }
}

async function addFolder(req, res) {
  try {
    const { newFolderName } = req.body;

    if (!newFolderName) {
      return res.status(400).json({ error: "Folder name is required" });
    } else {
      const folder = await prisma.folder.create({
        data: {
          name: newFolderName,
          userId: req.user.id,
        },
      });

      const wantsJSON =
        req.headers.accept && req.headers.accept.includes("application/json");
      if (wantsJSON) {
        return res.status(201).json(folder);
      }
      return res.redirect(`/home/${folder.id}`);
    }
  } catch (error) {
    console.log(`controller error @ addFolder - msg: ${error.message}`);

    return res.status(500).json({
      error: "Failed to create folder",
      message: error.message,
    });
  }
}

async function softDeleteFile(req, res) {
  try {
    const { deleteThisFile } = req.body;
    const fileID = Number(deleteThisFile);

    const file = await prisma.file.findUnique({
      where: { userId: req.user.id, id: fileID },
      select: { trashed: true, folderId: true },
    });

    if (!file) return res.redirect("/home");

    await prisma.file.update({
      where: { userId: req.user.id, id: fileID },
      data: { trashed: true },
    });

    return res.redirect(`/home/${file.folderId}`);
  } catch (error) {
    console.log(`Cannot move file to the trash: ${error.message}`);
  }
}

async function softDeleteFolder(req, res) {
  try {
    const { softDeleteFolder, redirectTo } = req.body;
    const folderID = Number(softDeleteFolder);

    const folder = await prisma.folder.findUnique({
      where: { userId: req.user.id, id: folderID },
      select: { trashed: true },
    });

    if (!folder)
      return res.redirect(
        redirectTo === "view-all-folders" ? "/home/view-all-folders" : "/home"
      );

    await prisma.folder.update({
      where: { userId: req.user.id, id: folderID },
      data: { trashed: true },
    });

    return res.redirect(
      redirectTo === "view-all-folders" ? "/home/view-all-folders" : "/home"
    );
  } catch (error) {
    console.log(`controller error @ softDeleteFolder - msg: ${error.message}`);
  }
}

async function postDeleteFolder(req, res) {
  try {
    const { deleteThisFolder } = req.body;
    const folderID = Number(deleteThisFolder);
    await prisma.folder.delete({
      where: { userId: req.user.id, id: folderID },
    });
    res.redirect(`/home/trash`);
  } catch (error) {
    return res.status(500).json({
      error: "Cannot delete file - server error",
    });
  }
}

async function restoreFile(req, res) {
  try {
    const { restoreThisFile } = req.body;
    const fileID = Number(restoreThisFile);
    await prisma.file.update({
      where: { userId: req.user.id, id: fileID },
      data: { trashed: false },
    });
    res.redirect(`/home/trash`);
  } catch (error) {
    return res.status(500).json({
      error: "Cannot delete file - server error",
    });
  }
}

async function restoreFolder(req, res) {
  try {
    const { restoreThisFolder } = req.body;
    const folderID = Number(restoreThisFolder);
    await prisma.folder.update({
      where: { userId: req.user.id, id: folderID },
      data: { trashed: false },
    });
    res.redirect(`/home/trash`);
  } catch (error) {
    return res.status(500).json({
      error: "Cannot delete folder - server error",
    });
  }
}

function logout(req, res) {
  try {
    req.logout(function (error) {
      if (error) {
        return res.status(500).json({
          error: "Cannot log you out - server error",
        });
      } else {
        return res.redirect("/");
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `controller error @ logout(): ${error.message}` });
  }
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
  viewAllFolders,
  viewFile,
  getTrash,
  addFolder,
  softDeleteFolder,
  softDeleteFile,
  restoreFile,
  restoreFolder,
  logout,
};
