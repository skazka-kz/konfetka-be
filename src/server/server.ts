import * as bodyParser from "body-parser";
import * as compression from "compression";
import cookieSession = require("cookie-session");
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import * as mongoose from "mongoose";
import * as passport from "passport";
import { Logger } from "winston";
import keys from "./helpers/keys";
import logger from "./helpers/Logger";

class Server {
  public app: express.Application;
  public logger: Logger;

  constructor() {
    this.app = express();
    this.logger = logger;
    this.configure();
    this.connect();
    this.routes();
    this.start();
  }

  public connect() {
    (async () => {
      // Using the useNewUrlParser option cause Mongo complains
      try {
        await mongoose.connect(
          keys.mongoUri,
          { useNewUrlParser: true }
        );
        logger.info("Connected to MongoDB");
      } catch (e) {
        logger.error(
          `Error connecting to MongoDB instance: ${e.code}, ${e.message}`
        );
      }
    })();
  }

  public configure(): void {
    const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
    this.logger.info(`Configuring the server for the ${env} environment...`);
    // Helmet for basic security for Express
    this.app.use(helmet());

    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: false,
        limit: "10mb"
      })
    );

    this.logger.info(
      `The cookie key starts with ${keys.cookieKey.substr(0, 2)}`
    );

    this.app.use(
      cookieSession({
        keys: [keys.cookieKey],
        maxAge: 30 * 24 * 60 * 60 * 1000,
        name: "session"
      })
    );

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    let corsOptions: object;
    switch (env) {
      case "production":
        corsOptions = {
          origin: "https://konfetka-shop.kz"
        };
        break;
      case "test":
      case "ci":
      default:
        corsOptions = {
          origin: "*"
        };
    }
    this.app.use(cors(corsOptions));

    this.app.use(compression());
  }

  public routes(): void {
    this.app.get("/", (req: express.Request, res: express.Response) => {
      res.send({ message: "Pong" });
    });
  }

  public start(): void {
    const PORT = process.env.PORT ? process.env.PORT : 5000;
    this.app.listen(PORT, () => {
      this.logger.info(`Express server listening on port ${PORT}`);
    });
  }

}

export default Server;
