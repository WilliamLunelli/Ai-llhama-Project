"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config/config"));
const agentRoutes_1 = __importDefault(require("./routes/agentRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// Rotas
app.use("/api/agent", agentRoutes_1.default);
// Rota de teste
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "O servidor está funcionando!" });
});
// Iniciar o servidor
app.listen(config_1.default.port, () => {
    console.log(`Servidor do agente de IA rodando na porta ${config_1.default.port}`);
    console.log(`Certifique-se de que o LM Studio está rodando em ${config_1.default.lmStudioApiUrl}`);
});
