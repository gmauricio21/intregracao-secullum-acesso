import { Router } from "express";
import { getConnection, sql } from "../database";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      n_folha,
      n_identificador,
      nome,
      empresa_cnpj,
      tipoAcesso,
      horario_nome,
      nivel_nome,
      estado,
      classificacao,
    } = req.body;

    if (!n_folha || !nome || !empresa_cnpj) {
      return res.status(400).json({
        message: "Campos obrigatórios: n_folha, nome e empresa_cnpj",
      });
    }

    let horarioFinal = horario_nome || null;
    let nivelFinal = nivel_nome || null;

    if (tipoAcesso === "HORARIO") {
      horarioFinal = horario_nome || "GERAL";
      nivelFinal = null;
    }

    if (tipoAcesso === "NIVEL") {
      nivelFinal = nivel_nome;
      horarioFinal = horario_nome || null;
    }

    const pool = await getConnection();

    const existeFolha = await pool
      .request()
      .input("n_folha", sql.VarChar(20), n_folha)
      .query(`
        SELECT TOP 1 n_folha, nome
        FROM dbo.integracao_externa
        WHERE n_folha = @n_folha
      `);

    if (existeFolha.recordset.length > 0) {
      return res.status(409).json({
        message: `Já existe uma pessoa cadastrada com o número folha ${n_folha}.`,
      });
    }

    await pool
      .request()
      .input("n_folha", sql.VarChar(20), n_folha)
      .input("n_identificador", sql.VarChar(20), n_identificador || null)
      .input("nome", sql.VarChar(100), nome)
      .input("empresa_cnpj", sql.VarChar(20), empresa_cnpj)
      .input("horario_nome", sql.VarChar(50), horarioFinal)
      .input("nivel_nome", sql.VarChar(50), nivelFinal)
      .input("estado", sql.TinyInt, estado ?? 0)
      .input("classificacao", sql.VarChar(50), classificacao || null)
      .query(`
        INSERT INTO dbo.integracao_externa (
          n_folha,
          n_identificador,
          nome,
          empresa_cnpj,
          horario_nome,
          nivel_nome,
          estado,
          classificacao,
          leitura_status,
          data_inclusao
        )
        VALUES (
          @n_folha,
          @n_identificador,
          @nome,
          @empresa_cnpj,
          @horario_nome,
          @nivel_nome,
          @estado,
          @classificacao,
          0,
          GETDATE()
        )
      `);

    return res.status(201).json({
      message: "Pessoa enviada para integração com sucesso",
      data: {
        n_folha,
        nome,
        empresa_cnpj,
        horario_nome: horarioFinal,
        nivel_nome: nivelFinal,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro ao enviar pessoa para integração",
      error,
    });
  }
});

router.get("/:n_folha/status", async (req, res) => {
  try {
    const { n_folha } = req.params;

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("n_folha", sql.VarChar(20), n_folha)
      .query(`
        SELECT
          n_folha,
          n_identificador,
          nome,
          leitura_status,
          leitura_data,
          leitura_resposta
        FROM dbo.integracao_externa
        WHERE n_folha = @n_folha
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Registro não encontrado na integração",
      });
    }

    return res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro ao consultar status da integração",
      error,
    });
  }
});

export default router;