import * as passport from "passport";
import * as passportLocal from "passport-local";
import { IUserDocument } from "../interfaces/UserDocument";
import User from "../models/User";

passport.serializeUser((user: IUserDocument, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(new Error("No user with such ID found"));
    }
  } catch (e) {
    done(e);
  }
});

passport.use(
  new passportLocal.Strategy(async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
      );
      if (!user) {
        return done(null, false);
      }
      const passwordVerification = await user.comparePassword(password);
      if (!passwordVerification) {
        return done(null, false);
      }
      return done(null, user);
    } catch (e) {
      done(e);
    }
  })
);
