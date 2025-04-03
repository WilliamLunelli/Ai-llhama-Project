"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTwoPdfs = exports.uploadSinglePdf = void 0;
// src/middleware/upload.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const pdfService_1 = require("../services/pdfService");
// Configurar storage para o Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const uploadDir = path_1.default.join(__dirname, "../../uploads");
        yield (0, pdfService_1.ensureUploadsDirectory)();
        cb(null, uploadDir);
    }),
    filename: (req, file, cb) => {
        // Usar timestamp para evitar nomes duplicados
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + extension);
    },
});
// Filtro para permitir apenas arquivos PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new Error("Apenas arquivos PDF são permitidos"));
    }
};
// Configurar o Multer
exports.uploadSinglePdf = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limite de 10MB
    },
}).single("pdf");
// Configuração para upload de dois PDFs para comparação
exports.uploadTwoPdfs = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limite de 10MB
    },
}).fields([
    { name: "pdf1", maxCount: 1 },
    { name: "pdf2", maxCount: 1 },
]);
