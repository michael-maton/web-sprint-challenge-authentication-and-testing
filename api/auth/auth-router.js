const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/secrets.js");
const User = require("../users/users-model");


async function uniqueUsername(req, res, next) {
  // console.log("Validating uniqueness of username")
  const { username } = req.body;
  const checking = await User.getBy({ username });
  if (checking.length) {
    res.status(409).json("username taken");
  } else {
    next();
  }
}

function validBody(req, res, next) {
  // console.log("Validating registration fields")
  const { username, password } = req.body;
  username && password
    ? next()
    : res.status(500).json("username and password required");
}

router.get("/users", (req, res) => {
  User.get()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      res.status(500).json({ err: err.message });
    });
});

router.post("/register", validBody, uniqueUsername, (req, res) => {
  const { username, password } = req.body;
  const hashedPass = bcrypt.hashSync(password, 12);

  User.add({ username, password: hashedPass })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      res.status(500).json({ err: err.message });
    });
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post("/login", validBody, async (req, res) => {
  const { username, password } = req.body;
  try {
    const checkingUser = await User.getBy({ username }).first();
    if (checkingUser && bcrypt.compareSync(password, checkingUser.password)) {
      const token = generateToken(checkingUser);
      res.status(200).json({ message: `welcome, ${username}`, token });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }

  } catch {
    res.status(500).json({ message: "username or password incorrect" });
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
