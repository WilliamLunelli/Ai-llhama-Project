// src/index.ts
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import config from "./config/config";
import agentRoutes from "./routes/agentRoutes";
import pdfRoutes from "./routes/pdfRoutes";
import fs from "fs-extra";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "../public")));

// Garantir que a pasta uploads existe
const uploadDir = path.join(__dirname, "../uploads");
fs.ensureDirSync(uploadDir);

// Rotas
app.use("/api/agent", agentRoutes);
app.use("/api/pdf", pdfRoutes);

// Rota de teste
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "O servidor está funcionando!" });
});

// Iniciar o servidor
app.listen(config.port, () => {
  console.log(`Servidor do agente de IA rodando na porta ${config.port}`);
  console.log(
    `Certifique-se de que o LM Studio está rodando em ${config.lmStudioApiUrl}`
  );
});
