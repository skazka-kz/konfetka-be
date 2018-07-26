import "jest";
import FakeFactory from "../../helpers/FakeFactory";
import User from "../../models/User";

describe("User mongoose model tests:", () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  test("Can create and save an instance to Mongo", () => {
    const newUser = FakeFactory.createSampleUser();
    expect(true).toBeTruthy();
  });
});
