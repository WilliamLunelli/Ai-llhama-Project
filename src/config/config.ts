// src/config/config.ts
import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  lmStudioApiUrl: process.env.LM_STUDIO_API_URL || "http://localhost:1234/v1",
};
