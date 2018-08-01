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

  //#region User Model tests
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

    const passwordComparison = await user.comparePassword("This is a password");
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
  // #endregion

  // #region Basic functionality with good parameters
  test("GET /users/ gets a list of all users", async () => {
    const userOne = createSampleUser();
    const userTwo = createSampleUser();

    await userOne.save();
    await userTwo.save();

    const response = await request.get("/api/v1/users");
    const data = response.body;
    expect(response.status).toBe(200);
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data[0]._id === userOne._id || data[0]._id === userTwo._id);
  });

  test("GET /users/:id gets the user by ID", async () => {
    const user = createSampleUser();
    await user.save();

    const response = await request.get(`/api/v1/users/${user._id}`);

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

    const response = await request.post("/api/v1/users").send(params);

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

    const response = await request
      .put(`/api/v1/users/${user._id}`)
      .send(updated);

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

    const response = await request.delete(`/api/v1/users/${user._id}`);
    expect(response.status).toBe(200);

    const loaded = await User.findById(user._id);
    expect(loaded).toBeFalsy();
  });

  //#endregion
});
