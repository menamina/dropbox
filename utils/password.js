const bcrypt = require("bcrypt");
const salt = 15;

async function hashThisEnteredPassword(password) {
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
}

async function verifyPass(password, hashed) {
  const match = await bcrypt.compare(password, hashed);
  return match;
}

module.exports = {
  hashThisEnteredPassword,
  verifyPass,
};
