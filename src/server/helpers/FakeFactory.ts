import * as faker from "faker";
import User from "../models/User";

export function createSampleUser(email?: string) {
  return new User({
    fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
    email: email ? email : faker.internet.email(),
    nickName: faker.internet.userName()
  });
}
