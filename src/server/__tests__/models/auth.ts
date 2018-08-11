import { Application } from "express";
import "jest";
import supertest = require("supertest");
import { createSampleUser } from "../../helpers/FakeFactory";
import User from "../../models/User";
import Server from "../../server";

let app: Application;
let request: supertest.SuperTest<supertest.Test>;
let user: any;
let originalPassword: string;

describe("User tests, both Mongoose model and REST API", () => {
  beforeAll(async () => {
    user = createSampleUser();
    originalPassword = user.password;
    await user.save();
  });

  beforeEach(async () => {
    app = new Server().app;
    request = supertest(app);
  });

  afterEach(() => {
    app = undefined;
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
    expect(Date.now() - expirationDate.getTime()).toBeLessThan(aMonthInMilliseconds);
  });
});
