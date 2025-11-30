import passport from "passport";
import passportLocal from "passport-local";
import  userModel  from "../models/user.model.js";
import { createHash, isValidPassword, PRIVATE_KEY } from "../utils.js";
/*import { Strategy as GitHubStrategy } from "passport-github2";*/
import jwtStrategy from "passport-jwt";

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;
const LocalStrategy = passportLocal.Strategy;

// --- COOKIE EXTRACTOR ---
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwtCookieToken"];
    console.log("JWT de la cookie: ", token);
  }
  return token;
};

const initializePassport = () => {
  // 🔹 JWT Strategy
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload.user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 🔹 GitHub Strategy
 /* passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:9090/api/sessions/githubcallback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });
          if (!user) {
            const newUser = {
              first_name: profile._json.email,
              last_name: "",
              email: profile._json.email,
              loggedBy: "GitHub"
            };
            const result = await userModel.create(newUser);
            return done(null, result);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );*/

  // 🔹 Register Strategy
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email, age } = req.body;
          const exist = await userModel.findOne({ email });
          if (exist) return done(null, false);
          const userDTO = { first_name, last_name, email, age, password: createHash(password) };
          const result = await userModel.create(userDTO);
          return done(null, result);
        } catch (error) {
          return done("Error registrando al usuario - " + error);
        }
      }
    )
  );

  // 🔹 Login Strategy
  passport.use(
    "login",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) return done(null, false, { message: "Usuario no existe" });
          if (!isValidPassword(user, password)) return done(null, false, { message: "Credenciales incorrectas" });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 🔹 Serialización / Deserialización
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default initializePassport;
