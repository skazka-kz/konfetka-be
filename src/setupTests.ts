import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as mongoose from "mongoose";
import keys from "./server/helpers/keys";
import logger from "./server/helpers/Logger";

configure({ adapter: new Adapter() });

(async () => {
  // Using the useNewUrlParser option cause Mongo complains
  try {
    await mongoose.connect(
      keys.mongoUri,
      { useNewUrlParser: true }
    );
    // logger.info("Connected to MongoDB test instance");
  } catch (e) {
    logger.error(
      `Error connecting to MongoDB test instance: Code: ${e.code}, Message: ${e.message}`
    );
  }
})();
