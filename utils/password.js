const bycrypt = require("bycrypt");
const salt = 15;

async function hashThisEnteredPassword(password) {
  const hashed = bycrypt.hash(password, salt);
  return hashed;
}

async function verifyPass(password, hashed) {
  const match = bycrypt.compare(password, hashed);
  return match;
}

module.exports {
    hashThisEnteredPassword,
    verifyPass
}