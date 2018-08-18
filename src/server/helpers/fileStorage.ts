import * as multer from "multer";
import * as path from "path";
import * as uniqid from "uniqid";
import config from "../../../config/keys";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.fileStorageFolder);
  },
  filename: (req, file, cb) => {
    let extension = path.extname(file.originalname);
    if (!extension) {
      switch (file.mimetype) {
        case "image/jpeg":
          extension = ".jpg";
          break;
        case "image/png":
          extension = ".png";
          break;
        case "image/gif":
          extension = ".gif";
          break;
        default:
          extension = ".jpg";
      }
    }
    cb(null, `image-${uniqid()}${extension}`);
  }
});

export default storage;
