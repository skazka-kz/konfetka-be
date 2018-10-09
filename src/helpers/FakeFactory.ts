import * as faker from "faker";
import Image from "../models/Image";
import Product from "../models/Product";
import User from "../models/User";

export function createSampleUser(email?: string) {
  return new User({
    fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
    email: email ? email : faker.internet.email(),
    nickName: faker.internet.userName(),
    password: faker.internet.password()
  });
}

export function createSampleProduct() {
  return new Product({
    title: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    weight: faker.random
      .number({ min: 150, max: 2500, precision: 50 })
      .toString(),
    price: faker.random.number({ min: 150, max: 3500, precision: 50 })
  });
}

export function createSampleImage() {
  return new Image({
    title: faker.lorem.sentence(),
    path: faker.image.food(600, 400),
    width: 600,
    height: 400,
    size: 123456,
    originalFileName: faker.lorem.sentence(),
    thumbnail: {
      path: faker.image.food(200, 133),
      size: 1234,
      width: 200,
      height: 133
    }
  });
}
