require("dotenv").config();
const express = require("express");
const server = express();
const port = process.env.PORT;
const path = require("node:path");
const passport = require("passport");
const session = require("express-session");

const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const prisma = new PrismaClient();

server.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
