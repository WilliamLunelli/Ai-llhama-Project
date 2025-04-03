// src/index.ts
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import config from "./src/config/config";
import agentRoutes from "./src/routes/agentRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Rotas
app.use("/api/agent", agentRoutes);

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
