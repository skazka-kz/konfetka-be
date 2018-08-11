import { Application } from "express";
import "jest";
import supertest = require("supertest");
import { createSampleUser } from "../../helpers/FakeFactory";
import User from "../../models/User";
import Server from "../../server";

let app: Application = new Server().app;
let request: supertest.SuperTest<supertest.Test>;
let user: any;
let originalPassword: string;

describe("User tests, both Mongoose model and REST API", () => {
  beforeAll(async () => {
    user = createSampleUser();
    originalPassword = user.password;
    await user.save();
  });

  afterAll(async () => {
    User.findByIdAndRemove(user._id);
  });

  beforeEach(async () => {
    request = supertest(app);
  });

  afterEach(() => {
    request = undefined;
  });

  test("POST /login with the correct credentials returns the right response + cookies", async () => {
    // Send POST to /login
    const loginProps = {
      username: user.email,
      password: originalPassword
    };

    const response = await request.post("/api/v1/auth/login").send(loginProps);
    expect(response.status).toBe(200);
    // Should return cookies, named session and session.sig, with reasonable expiration date
    expect(response.header["set-cookie"]).toBeDefined();
    expect(response.header["set-cookie"].length).toBe(2);
    expect(response.header["set-cookie"][0]).toMatch(/session=/);
    expect(response.header["set-cookie"][1]).toMatch(/session.sig=/);
    const sessionCookie = response.header["set-cookie"][0];
    // The cookie looks like this: session=blabla; path=/; expires=Mon, 10 Sep 2018 12:35:49 GMT; httponly
    // Chop it up to just get the date string
    const expirationDate = new Date(
      sessionCookie.slice(
        sessionCookie.indexOf("expires=") + 8,
        sessionCookie.indexOf("; httponly")
      )
    );
    const aMonthInMilliseconds = 31 * 24 * 60 * 60 * 1000;
    // Cookie expiration should be 30 days,
    expect(Date.now() - expirationDate.getTime()).toBeLessThan(
      aMonthInMilliseconds
    );
  });

  test("POST to /login with existing email but wrong password sends the correct response", async () => {
    const loginProps = {
      username: user.email,
      password: "Wrong Password"
    };

    const response = await request.post("/api/v1/auth/login").send(loginProps);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Error: Wrong email or password");
  });

  test("POST to /login with non-existing email sends the correct response", async () => {
    const loginProps = {
      username: "email@doesnt.exist",
      password: "Wrong Password"
    };

    const response = await request.post("/api/v1/auth/login").send(loginProps);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Error: Wrong email or password");
  });

  test("GET to /user when not logged in returns nothing", async () => {
    const response = await request.get("/api/v1/auth/user");
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Error: Not logged in");
  });

  test("GET to /user when logged in returns the current user", async () => {
    // Use separate supertest instance so not to interfere with other tests
    const sSuperTest = supertest(new Server().app);

    // Login and make a note of the session token and session signature
    const loginProps = {
      username: user.email,
      password: originalPassword
    };

    const loginResponse = await sSuperTest
      .post("/api/v1/auth/login")
      .send(loginProps);
    const sessionCookies = loginResponse.header["set-cookie"];
    const req = sSuperTest.get("/api/v1/auth/user");
    req.cookies = sessionCookies;
    const response = await req;
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(user.email);
    expect(response.body._id).toBe(user.id);
  });
});
