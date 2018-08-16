import * as dotenv from "dotenv";
dotenv.config();

interface IKeys {
  cookieKey: string;
  mongoUri: string;
  fileStorageFolder: string;
}

let keys: IKeys;

// Separate keys for Production, CI, Test and Dev environments
// Prod and CI are extracted through environmental variables
// Test and dev are extracted from the .env file

if (
  process.env.NODE_ENV === "production" ||
  process.env.CI ||
  process.env.NODE_ENV === "ci"
) {
  keys = {
    cookieKey: process.env.COOKIE_KEY
      ? process.env.COOKIE_KEY
      : process.env.TEST_COOKIE_KEY,
    mongoUri: process.env.MONGO_URI
      ? process.env.MONGO_URI
      : process.env.TEST_MONGO_URI,
    fileStorageFolder: process.env.UPLOAD_PATH
      ? process.env.UPLOAD_PATH
      : process.env.TEST_UPLOAD_PATH
  };
} else if (process.env.NODE_ENV === "test") {
  keys = {
    cookieKey: process.env.TEST_COOKIE_KEY,
    mongoUri: process.env.TEST_MONGO_URI,
    fileStorageFolder: process.env.TEST_UPLOAD_PATH
  };
} else {
  keys = {
    cookieKey: process.env.DEV_COOKIE_KEY,
    mongoUri: process.env.DEV_MONGO_URI,
    fileStorageFolder: process.env.DEV_UPLOAD_PATH
  };
}

export default keys;
