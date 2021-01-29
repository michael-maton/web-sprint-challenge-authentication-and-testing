const db = require("../../data/dbConfig");

module.exports = {
  get,
  getBy,
  add,
};

function get() {
  return db("users");
}

function getBy(filter) {
  return db("users").where(filter).orderBy("id");
}

async function add(details) {
  const newUserID = await db("users").insert(details);
  return db("users").where("id", newUserID).first();
}
