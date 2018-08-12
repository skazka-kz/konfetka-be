import { Application } from "express";
import "jest";
import supertest = require("supertest");
import { createSampleUser } from "../../helpers/FakeFactory";
import { IUserProps, IUserUpdateProps } from "../../interfaces/UserDocument";
import User from "../../models/User";
import Server from "../../server";

let app: Application;
let request: supertest.SuperTest<supertest.Test>;

describe("User tests, both Mongoose model and REST API", () => {
  beforeEach(async () => {
    app = new Server().app;
    request = supertest(app);
  });

  afterEach(() => {
    app = undefined;
    request = undefined;
  });

  afterAll(async () => {
    const result = await User.deleteMany({});
  });

  describe("Simple mongoose model tests", () => {
    test("Can create and save an instance to Mongo, verify by ID", async () => {
      const newUser = createSampleUser();
      await newUser.save();
      const loadedFromDb = await User.findById(newUser._id);

      expect(newUser._id).toEqual(loadedFromDb._id);
      expect(newUser.fullName).toEqual(loadedFromDb.fullName);
    });

    test("Hashes new user passwords, not saved as plaintext", async () => {
      const newUser = createSampleUser();
      newUser.password = "I'm a password";
      await newUser.save();
      const loadedFromDb = await User.findById(newUser._id).select("password");
      // Should exist as a field
      expect(loadedFromDb.password).toBeTruthy();
      // Should not be the same string
      expect(loadedFromDb.password === "I'm a password").toBeFalsy();
      // Should be a really long hash
      expect(loadedFromDb.password.length).toBeGreaterThan(20);
    });

    test("Two users with same passwords have different hashes", async () => {
      const userOne = createSampleUser();
      const userTwo = createSampleUser();
      userOne.password = userTwo.password = "Similar passwords";

      await userOne.save();
      await userTwo.save();

      expect(userOne.password).toBeTruthy();
      expect(userTwo.password).toBeTruthy();
      expect(userOne.password === userTwo.password).toBeFalsy();
    });

    test("User password comparison successfully checks a right password", async () => {
      const user = createSampleUser();
      user.password = "This is a password";

      await user.save();

      const passwordComparison = await user.comparePassword(
        "This is a password"
      );
      expect(passwordComparison).toBeTruthy();
    });

    test("User password comparison rejects a wrong password", async () => {
      const user = createSampleUser();
      user.password = "This is a password";

      await user.save();

      const passwordComparison = await user.comparePassword(
        "This is a wrong password"
      );
      expect(passwordComparison).toBeFalsy();
    });
  });

  describe("REST API tests", () => {
    describe("User tests that require authentication", () => {
      //#region Basic functionality with good parameters
      let authCookies: any;
      beforeAll(async () => {
        const user = createSampleUser();
        const originalPassword = user.password;
        // Make sure the user is an Admin
        user.isAdmin = true;
        await user.save();

        const loginProps = {
          username: user.email,
          password: originalPassword
        };

        const response = await supertest(new Server().app)
          .post("/api/v1/auth/login")
          .send(loginProps);
        authCookies = response.header["set-cookie"];
      });

      test("GET /users/ gets a list of all users", async () => {
        const userOne = createSampleUser();
        const userTwo = createSampleUser();

        await userOne.save();
        await userTwo.save();

        const req = request.get("/api/v1/users");
        req.cookies = authCookies;
        const response = await req;
        const data = response.body;
        expect(response.status).toBe(200);
        expect(data.length).toBeGreaterThanOrEqual(2);
        expect(data[0]._id === userOne._id || data[0]._id === userTwo._id);
      });

      test("GET /users/:id gets the user by ID", async () => {
        const user = createSampleUser();
        await user.save();

        const req = request.get(`/api/v1/users/${user._id}`);
        req.cookies = authCookies;
        const response = await req;

        expect(response.status).toBe(200);
        expect(response.body.email).toBe(user.email);
        expect(response.body.nickName).toBe(user.nickName);
        expect(response.body.password).toBeFalsy();
      });

      test("POST /users/ creates a user and saves to DB", async () => {
        const params: IUserProps = {
          email: "valid@email.com",
          password: "StrongPassword",
          fullName: "Jacob"
        };

        const req = request.post("/api/v1/users").send(params);
        req.cookies = authCookies;
        const response = await req;

        expect(response.status).toBe(200);
        expect(response.body.email).toBe(params.email);
        expect(response.body.password).toBeFalsy();
        expect(response.body.fullName).toBe(params.fullName);

        const loadedFromDb = await User.findById(response.body._id);

        expect(loadedFromDb.email).toBe(params.email);
        expect(loadedFromDb.fullName).toBe(params.fullName);
        expect(loadedFromDb.password).toBeFalsy();
      });

      test("PUT /users/:id updates the user in the DB", async () => {
        const user = createSampleUser();
        await user.save();

        const updated: IUserUpdateProps = {
          email: "updated@email.com",
          fullName: "Updated Name",
          nickName: "updated.nick"
        };

        const req = request.put(`/api/v1/users/${user._id}`).send(updated);
        req.cookies = authCookies;
        const response = await req;

        expect(response.status).toBe(200);
        expect(response.body.email).toBe(updated.email);
        expect(response.body.fullName).toBe(updated.fullName);
        expect(response.body.nickName).toBe(updated.nickName);

        const loadedFromDb = await User.findById(user._id);

        expect(loadedFromDb.email).toBe(updated.email);
        expect(loadedFromDb.fullName).toBe(updated.fullName);
        expect(loadedFromDb.nickName).toBe(updated.nickName);
      });

      test("DELETE /users/:id removes the user from the DB", async () => {
        const user = createSampleUser();
        await user.save();

        const req = request.delete(`/api/v1/users/${user._id}`);
        req.cookies = authCookies;
        const response = await req;

        expect(response.status).toBe(200);
        const loaded = await User.findById(user._id);
        expect(loaded).toBeFalsy();
      });

      // #endregion

      //#region Odd cases, testing handling errors
      test("DELETE /users/:id returns a proper error when quering a non-existent user", async () => {
        const req = request.delete("/api/v1/users/507f191e810c19729de860ea");
        req.cookies = authCookies;
        const response = await req;
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          "Error: User with such ID does not exist"
        );
      });

      test("GET /users/:id returns a proper error when querying a non-existent user", async () => {
        const req = request.get("/api/v1/users/507f191e810c19729de860ea");
        req.cookies = authCookies;
        const response = await req;
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          "Error: User with such ID does not exist"
        );
      });

      test("POST /users/ with wrong email returns a meaningful error", async () => {
        const props: IUserProps = {
          email: "wrongemail.com",
          password: "A password"
        };

        const req = request.post("/api/v1/users").send(props);
        req.cookies = authCookies;
        const response = await req;
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Error: Invalid email format");
      });

      test("POST /users/ with missing parameters returns meaningful errors", async () => {
        const noEmailProps: any = {
          password: "A password",
          fullName: "Some name"
        };
        const req = request.post("/api/v1/users").send(noEmailProps);
        req.cookies = authCookies;
        const response = await req;
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Error: No email provided");

        const noPasswordProps: any = {
          email: "valid@email.com",
          fullName: "Some name"
        };
        const noPassReq = request.post("/api/v1/users").send(noPasswordProps);
        noPassReq.cookies = authCookies;
        const noPassResponse = await noPassReq;
        expect(noPassResponse.status).toBe(400);
        expect(noPassResponse.body.message).toBe("Error: No password provided");
      });

      test("PUT /users/:id with no invalid email returns a meaningful error", async () => {
        const user = createSampleUser();
        await user.save();

        const updateProps: IUserUpdateProps = {
          email: "notavalidemail.com"
        };

        const req = request.put(`/api/v1/users/${user._id}`).send(updateProps);
        req.cookies = authCookies;
        const response = await req;
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Error: Invalid email format");
      });

      // #endregion
    });
    describe("Make sure protected routes require authentication", () => {
      test("GET /users not publicly accessible", async () => {
        const response = await request.get("/api/v1/users");
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );
      });

      test("GET /users/:id not publicly accessible", async () => {
        const response = await request.get("/api/v1/users/someID");
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );
      });

      test("POST /users not publicly accessible", async () => {
        const response = await request.post("/api/v1/users").send({
          email: "some@email.com",
          password: "somepass"
        });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );
      });

      test("PUT /users/:id not publicly accessible", async () => {
        const response = await request.put("/api/v1/users/someId").send({
          email: "some@email.com",
          password: "somepass"
        });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );
      });

      test("DELETE /users/:id not publicly accessible", async () => {
        const response = await request.delete("/api/v1/users/someID");
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );
      });
    });
  });
});
