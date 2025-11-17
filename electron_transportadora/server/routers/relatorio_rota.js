const express = require('express');
const router = express.Router();
const db = require('../db'); // conexão MySQL

// ==================================================
// LISTAR RELATÓRIOS DE ROTAS (baseados em financeiro_trajeto)
// ==================================================
router.get('/', (req, res) => {
  const search = req.query.q || '';

  const query = `
    SELECT 
      f.idFinanceiro_trajeto AS id,
      v.modelo AS veiculo,
      CONCAT(r.endereco_origem, ' → ', r.endereco_destino) AS rota,
      f.valor_pedagio AS pedagio,
      f.preco_km,
      f.custo_motorista,
      f.valor_total_passageiros AS valor_passageiro_mensal
    FROM financeiro_trajeto f
    JOIN trajetos t ON f.trajetos_idTrajetos = t.idTrajetos
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    WHERE 
      v.modelo LIKE ? OR 
      r.endereco_origem LIKE ? OR 
      r.endereco_destino LIKE ?;
  `;

  const searchValue = `%${search}%`;

  db.query(query, [searchValue, searchValue, searchValue], (err, results) => {
    if (err) {
      console.error('Erro ao buscar relatórios de rotas:', err);
      return res.status(500).send('Erro ao buscar relatórios de rotas');
    }

    // Renderiza o EJS relatorio_rota.ejs
    res.render('relatorio_rota', { relatorios: results, q: search });
  });
});

// ==================================================
// ROTA DE BUSCA (JSON) — usada para pesquisas dinâmicas se quiser
// ==================================================
router.get('/buscar', (req, res) => {
  const q = `%${req.query.q || ''}%`;

  const sql = `
    SELECT 
      f.idFinanceiro_trajeto AS id,
      v.modelo AS veiculo,
      CONCAT(r.endereco_origem, ' → ', r.endereco_destino) AS rota,
      f.valor_pedagio AS pedagio,
      f.preco_km,
      f.custo_motorista,
      f.valor_total_passageiros AS valor_passageiro_mensal
    FROM financeiro_trajeto f
    JOIN trajetos t ON f.trajetos_idTrajetos = t.idTrajetos
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    WHERE 
      v.modelo LIKE ? OR 
      r.endereco_origem LIKE ? OR 
      r.endereco_destino LIKE ?
    LIMIT 20;
  `;

  db.query(sql, [q, q, q], (err, results) => {
    if (err) {
      console.error('Erro ao buscar relatórios:', err);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

module.exports = router;
