import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import patientsRouter from "./patients.js";
import scansRouter from "./scans.js";
import reportsRouter from "./reports.js";
import analyticsRouter from "./analytics.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/patients", patientsRouter);
router.use("/scans", scansRouter);
router.use("/reports", reportsRouter);
router.use("/analytics", analyticsRouter);

export default router;
