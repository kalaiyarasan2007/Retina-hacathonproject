import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// 1. Mount API routes under /api
app.use("/api", router);

// 2. Resolve React frontend production build path
const frontendDistPath = [
  path.resolve(process.cwd(), "artifacts/retina-guard/dist/public"),
  path.resolve(process.cwd(), "../retina-guard/dist/public"),
  path.resolve(process.cwd(), "dist/public"),
].find((candidate) => fs.existsSync(candidate)) ?? path.resolve(process.cwd(), "artifacts/retina-guard/dist/public");

// 3. Serve static assets with express.static
app.use(express.static(frontendDistPath));

// 4. Safe Express 5-compatible SPA fallback for client-side routing
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    const indexPath = path.join(frontendDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

export default app;
