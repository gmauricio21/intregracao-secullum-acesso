import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pessoasRoutes from "./routes/pessoas.routes";
import opcoesRoutes from "./routes/opcoes.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Integração Secullum rodando" });
});

app.use("/pessoas", pessoasRoutes);

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});

app.use("/opcoes", opcoesRoutes);