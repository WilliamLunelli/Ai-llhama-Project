// src/routes/agentRoutes.ts
import { Router } from "express";
import * as agentController from "../controllers/agentController";

const router = Router();

router.post("/general", agentController.handleGeneralQuery);
router.post("/customer-support", agentController.handleCustomerSupport);

export default router;
