import { shallow } from "enzyme";
import * as React from "react";
import App from "./App";

it("Renders the App shallowly", () => {
  shallow(<App />);
});
