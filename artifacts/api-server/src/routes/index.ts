import { Router, type IRouter } from "express";
import healthRouter from "./health";
import trustscoreRouter from "./trustscore";

const router: IRouter = Router();

router.use(healthRouter);
router.use(trustscoreRouter);

export default router;
