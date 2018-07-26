import User from "../models/User";

class FakeFactory {
  public createSampleUser(name?: string) {
    return new User({
      fullName: name ? name : "John Smith",
      email: "john@smith.com",
      nickName: "Smithinator99"
    });
  }
}
export default FakeFactory;
