const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const sessions = require("express-session");
const KnexSessionStore = require("connect-session-knex")(sessions); //for storing sessions in db

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");
const knexConfig = require("../database/dbConfig.js");

const server = express();

const sessionConfig = {
  name: "ohfosho", //default would be 'sid'
  secret: "keep it secret, keep it safe!", //change according to env, use an environment variable for this
  cookie: {
    httpOnly: true, // JS cannot access the cookies
    maxAge: 1000 * 60 * 60, //expiration time in milliseconds
    // secure: process.env.NODE_ENV  === production ? true : false //should be true in production
    secure: false, //use cookie over HTTPS only. Should be true in production
  },
  resave: false,
  saveUninitialized: true, // read about GDPR compliance about cookies

  // change to use our database instead of memory to save the sessions
  store: new KnexSessionStore({
    knex: knexConfig,
    createtable: true, //automatically create the sessions table
    clearInterval: 1000 * 60 * 30, //delete expired sessions every 30 min
  }),
};

//global middleware
server.use(sessions(sessionConfig)); //turn on sessions support

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
