import * as multer from "multer";
import * as path from "path";
import * as uniqid from "uniqid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (process.env.NODE_ENV === "test") {
      cb(null, "./uploads/test");
    } else {
      cb(null, "./uploads");
    }
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
    cb(null, `product_image-${uniqid()}${extension}`);
  }
});
