import { shallow } from "enzyme";
import * as React from "react";
import App from "../components/App";

describe("<App /> Tests", () => {
  test("Renders the App shallowly", () => {
    const el = shallow(<App />);
    expect(el.length).toBe(1);
  });
});
