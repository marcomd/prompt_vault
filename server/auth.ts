import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Check if Google OAuth credentials are available
  const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

  if (hasGoogleCredentials) {
    // Google OAuth Strategy
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: "/auth/google_oauth2/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Upsert user in database
            const user = await storage.upsertUser({
              id: profile.id,
              email: profile.emails?.[0]?.value || null,
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
            });
            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await storage.getUser(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });

    // Auth routes
    app.get(
      "/api/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/?error=auth_failed" }),
      (req, res) => {
        res.redirect("/");
      }
    );

    // Alternative callback route format that some OAuth setups expect
    app.get(
      "/auth/google_oauth2/callback",
      passport.authenticate("google", { failureRedirect: "/?error=auth_failed" }),
      (req, res) => {
        res.redirect("/");
      }
    );

    app.get("/api/auth/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });
  } else {
    console.log("Google OAuth credentials not found. Authentication disabled - users can only read data.");
    
    // Mock auth routes for development (redirect to info page)
    app.get("/api/auth/google", (req, res) => {
      res.status(400).json({ 
        error: "Google OAuth not configured",
        message: "Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables"
      });
    });

    app.get("/api/auth/logout", (req, res) => {
      res.redirect("/");
    });
  }
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// For read-only operations when authentication is not configured
export const allowReadOnlyAccess: RequestHandler = (req: any, res, next) => {
  // If Google OAuth is not configured, allow read operations
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return next();
  }
  
  // If configured, require authentication
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};