// src/middleware/upload.ts
import multer from "multer";
import path from "path";
import { ensureUploadsDirectory } from "../services/pdfService";

// Configurar storage para o Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    await ensureUploadsDirectory();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Usar timestamp para evitar nomes duplicados
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// Filtro para permitir apenas arquivos PDF
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos PDF são permitidos"));
  }
};

// Configurar o Multer
export const uploadSinglePdf = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
}).single("pdf");

// Configuração para upload de dois PDFs para comparação
export const uploadTwoPdfs = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
}).fields([
  { name: "pdf1", maxCount: 1 },
  { name: "pdf2", maxCount: 1 },
]);
