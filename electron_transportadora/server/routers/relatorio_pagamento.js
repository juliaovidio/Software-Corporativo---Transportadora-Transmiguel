const express = require('express');
const router = express.Router();
const db = require('../db'); // conexão MySQL

// =======================================
// LISTAR RELATÓRIO DE PAGAMENTOS
// =======================================
router.get('/', (req, res) => {
  const search = req.query.q || ''; // termo de busca opcional

  // Query para buscar pagamentos + nome do passageiro
  const query = `
    SELECT 
      p.idPagamento_passageiro AS id,
      pas.nome AS nome,
      p.data,
      p.valor_pago,
      p.status,
      p.forma_pagamento
    FROM pagamento_passageiro p
    JOIN passageiro pas ON p.passageiro_idPassageiro = pas.idPassageiro
    WHERE 
      pas.nome LIKE ? OR
      p.forma_pagamento LIKE ?
    ORDER BY p.data DESC
  `;

  const searchValue = `%${search}%`;

  db.query(query, [searchValue, searchValue], (err, results) => {
    if (err) {
      console.error('Erro ao buscar relatório de pagamentos:', err);
      return res.status(500).send('Erro ao buscar relatório de pagamentos');
    }

    // Renderiza o EJS com os resultados
    res.render('relatorio_pagamento', { relatorios: results, q: search });
  });
});

// =======================================
// ROTA DE BUSCA DINÂMICA (JSON) OPCIONAL
// =======================================
router.get('/buscar', (req, res) => {
  const search = `%${req.query.q || ''}%`;

  const query = `
    SELECT 
      p.idPagamento_passageiro AS id,
      pas.nome AS nome,
      p.data,
      p.valor_pago,
      p.status,
      p.forma_pagamento
    FROM pagamento_passageiro p
    JOIN passageiro pas ON p.passageiro_idPassageiro = pas.idPassageiro
    WHERE 
      pas.nome LIKE ? OR
      p.forma_pagamento LIKE ?
    ORDER BY p.data DESC
    LIMIT 20
  `;

  db.query(query, [search, search], (err, results) => {
    if (err) {
      console.error('Erro ao buscar pagamentos:', err);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

module.exports = router;
