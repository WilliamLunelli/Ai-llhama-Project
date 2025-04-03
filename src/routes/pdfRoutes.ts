// src/routes/pdfRoutes.ts
import { Router } from "express";
import * as pdfController from "../controllers/pdfController";
import { uploadSinglePdf, uploadTwoPdfs } from "../middleware/upload";

const router = Router();

// Rota para upload e análise de um único PDF
router.post(
  "/upload",
  (req, res, next) => {
    uploadSinglePdf(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || "Erro ao fazer upload do arquivo",
          success: false,
        });
      }
      next();
    });
  },
  pdfController.handlePdfUpload
);

// Rota para comparação de dois PDFs
router.post(
  "/compare",
  (req, res, next) => {
    uploadTwoPdfs(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || "Erro ao fazer upload dos arquivos",
          success: false,
        });
      }
      next();
    });
  },
  pdfController.handlePdfComparison
);

export default router;
