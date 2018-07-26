import User from "../models/User";

export function createSampleUser(email?: string) {
  return new User({
    fullName: "John Smith",
    email: email ? email : "john@smith.com",
    nickName: "Smithinator99"
  });
}
