import { Router } from "express";
import { getConnection } from "../database";

const router = Router();

router.get("/classificacoes", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT id, descricao AS nome
      FROM dbo.classificacoes
      ORDER BY descricao
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar classificações", error });
  }
});

router.get("/empresas", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT id, nome, cnpj
      FROM dbo.empresas
      ORDER BY nome
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar empresas", error });
  }
});

router.get("/horarios", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        id, 
        nome,
        CASE 
          WHEN nome LIKE '%Nivel%' THEN 'NIVEL'
          WHEN nome LIKE '%Nível%' THEN 'NIVEL'
          ELSE 'HORARIO'
        END AS tipo
      FROM dbo.horarios
      ORDER BY id
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar horários", error });
  }
});

router.get("/niveis", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT id, descricao AS nome
      FROM dbo.niveis
      WHERE descricao <> '<Nenhum>'
      ORDER BY descricao
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar níveis", error });
  }
});

export default router;