const express = require('express');
const router = express.Router();
const db = require('../db'); // conexão com banco

// ==========================
// Rota para listar funcionários
// ==========================
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      f.idFuncionarios, 
      f.nome, 
      f.telefone, 
      f.cpf, 
      f.email, 
      f.cargo_idCargo,
      c.tipo AS cargo_tipo
    FROM funcionarios f
    LEFT JOIN cargo c ON f.cargo_idCargo = c.idCargo
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionários:', err);
      return res.status(500).send('Erro no servidor');
    }

    // Renderiza a view passando os resultados
    res.render('funcionario', { listaFuncionarios: results });
  });
});

// ==========================
// Buscar funcionários (autocomplete)
// ==========================
router.get('/buscar', (req, res) => {
  const termo = req.query.q || '';
  const sql = `SELECT idFuncionarios, nome FROM funcionarios WHERE nome LIKE ? LIMIT 10`;

  db.query(sql, [`%${termo}%`], (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionários:', err);
      return res.status(500).json({ erro: 'Erro ao buscar funcionários' });
    }
    res.json(results);
  });
});

module.exports = router;
