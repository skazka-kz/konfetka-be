import { Application } from "express";
import "jest";
import supertest = require("supertest");
import { createSampleUser } from "../../helpers/FakeFactory";
import { IUserProps, IUserUpdateProps } from "../../interfaces/UserDocument";
import Product from "../../models/Product";
import User from "../../models/User";
import Server from "../../server";

let app: Application;
let request: supertest.SuperTest<supertest.Test>;

describe("Test suite for the Product model", () => {
  describe("Simple mongoose tests", () => {
    test("Can create, save and load a mongoose model", async () => {});
  });

  describe("REST API tests", () => {
    beforeEach(async () => {
      app = new Server().app;
      request = supertest(app);
    });

    afterEach(() => {
      app = undefined;
      request = undefined;
    });

    afterAll(async () => {
      // Doesn't work if not assigned to a variable
      const result = await Product.deleteMany({});
    });
    describe("Public setupRoutes", () => {
      test("GET /products gets a list of products", async () => {
        expect(true).toBeTruthy();
      });
    });
    describe("Protected setupRoutes that require authentication", () => {
      let editorCookies: any;
      beforeAll(async () => {
        // Create a user, login, save cookies. Send cookies for protected setupRoutes
        const user = createSampleUser();
        const originalPassword = user.password;
        user.isEditor = true;
        await user.save();

        const authResponse = await request.post("/api/v1/auth/login").send({
          username: user.email,
          password: originalPassword
        });
        editorCookies = authResponse.header["set-cookie"];
      });
    });
    describe("Make sure protected setupRoutes are secured", () => {});
  });
});
