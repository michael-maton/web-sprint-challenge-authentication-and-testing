// Write your tests here
test("sanity", () => {
  expect(true).toBe(true);
});

const request = require("supertest");
const server = require("./server");
const db = require("./../data/dbConfig");
const Users = require("./users/users-model");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

const user1 = { username: "bffob", password: "1234" };
const user2 = { username: "mdsfe12", password: "1234" };

describe("endpoints", () => {
  describe("[POST] /api/auth/register", () => {
    it("responds with code 201 upon success", async () => {
      let res = await request(server).post("/api/auth/register").send(user1);
      expect(res.status).toBe(201);
    });

    it("responds with new user", async () => {
      const res = await request(server).post("/api/auth/register").send(user2);
      expect(res.body.username).toBe(user2.username);
      expect(res.body.password).toBeDefined(); // couldn't compare passwords because returned password is hashed
      expect(res.body.id).toBeDefined();
    });
  });

  describe("[POST] /api/auth/login", () => {
    it("responds with code 200 upon success", async () => {
      await request(server).post("/api/auth/register").send(user1);
      const res = await request(server).post("/api/auth/login").send(user1);
      expect(res.status).toBe(200);
    });

    it("responds with a token", async () => {
      await request(server).post("/api/auth/register").send(user1);
      const res = await request(server).post("/api/auth/login").send(user1);
      expect(res.body.token).toBeTruthy();
    });
  });

});
