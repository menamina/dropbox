require("dotenv").config();
const express = require("express");
const server = express();
const session = require("express-session");
const passport = require("./config/passport");
const port = process.env.PORT;
const path = require("node:path");

const prisma = require("./prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const routes = require("./routes/routes");

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));
server.use(express.static("public"));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// SESSION

server.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// PASSPORT

server.use(passport.initialize());
server.use(passport.session());

server.use("/", routes);

server.listen(port, (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log(`active`);
});
