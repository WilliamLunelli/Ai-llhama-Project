"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/pdfRoutes.ts
const express_1 = require("express");
const pdfController = __importStar(require("../controllers/pdfController"));
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Rota para upload e análise de um único PDF
router.post("/upload", (req, res, next) => {
    (0, upload_1.uploadSinglePdf)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                error: err.message || "Erro ao fazer upload do arquivo",
                success: false,
            });
        }
        next();
    });
}, pdfController.handlePdfUpload);
// Rota para comparação de dois PDFs
router.post("/compare", (req, res, next) => {
    (0, upload_1.uploadTwoPdfs)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                error: err.message || "Erro ao fazer upload dos arquivos",
                success: false,
            });
        }
        next();
    });
}, pdfController.handlePdfComparison);
exports.default = router;
