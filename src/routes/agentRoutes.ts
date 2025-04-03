// src/routes/agentRoutes.ts
import { Router } from "express";
import * as agentController from "../controllers/agentController";
import * as budgetComparisonController from "../controllers/budgetComparisonController";

const router = Router();

router.post("/general", agentController.handleGeneralQuery);
router.post("/customer-support", agentController.handleCustomerSupport);
router.post(
  "/budget-comparison",
  budgetComparisonController.handleBudgetComparison
);

export default router;
