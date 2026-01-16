const prisma = require("../prisma/client");
const path = require("path");

async function addFile(req, res) {
  try {
    const files = req.files;
    const folderID = Number(req.body.folderId);
    if (!files) {
      return res.status(400).send("no file(s) uploaded");
    } else {
      const data = files.map((file) => ({
        userId: req.user.id,
        name: file.originalname,
        multerName: file.filename,
        folderId: folderID,
      }));
      await prisma.file.createMany({ data });

      res.redirect(`/folders/${folderID}`);
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function viewFile(req, res) {
  try {
    const fileID = Number(req.params.fileID);
    userID = req.user.id;
    const file = await prisma.file.findUnique({
      where: {
        userId: userID,
        fileId: fileID,
        folderId: Number(req.params.folderID),
      },
    });
    const filePath = path.resolve("uploads", file.multerName);
    return res.sendFile(filePath);
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { addFile, viewFile };
