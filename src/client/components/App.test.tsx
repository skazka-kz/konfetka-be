import { shallow } from "enzyme";
import * as React from "react";
import App from "./App";

describe("<App /> Tests", () => {
  test("Renders the App shallowly", () => {
    shallow(<App />);
  });
});
