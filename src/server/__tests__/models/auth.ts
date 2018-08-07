import { Application } from "express";
import "jest";
import supertest = require("supertest");
import { createSampleUser } from "../../helpers/FakeFactory";
import User from "../../models/User";
import Server from "../../server";

let app: Application;
let request: supertest.SuperTest<supertest.Test>;
let user: any;
let originalPassport: string;

describe("User tests, both Mongoose model and REST API", () => {
  beforeAll(async () => {
    user = createSampleUser();
    originalPassport = user.password;
    await user.save();
  });

  beforeEach(async () => {
    app = new Server().app;
    request = supertest(app);
  });

  test("POST /login with the correct credentials returns the right response + cookies", async () => {
    // Send POST to /login
  });
});
