const express = require('express');
const router = express.Router();
const db = require('../db');

const { Fila } = require('../queue/veiculoFila');
const { TabelaHash } = require('../queue/veiculoHash');

const filaVeiculos = new Fila();
const tabelaHash = new TabelaHash();

// ======================
// Rota: Listar Veículos
// ======================
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const erro = req.query.erro || null;
  let sql = 'SELECT * FROM veiculos';
  const params = [];

  if (q) {
    sql += ' WHERE placa LIKE ? OR modelo LIKE ? OR capacidade LIKE ?';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar veículos:', err);
      return res.status(500).send('Erro no banco de dados');
    }

    // Limpa e popula as estruturas de dados
    filaVeiculos.limpar();
    results.forEach(v => filaVeiculos.enqueue(v));

    tabelaHash.limpar();
    results.forEach(v => tabelaHash.adicionar(v));

    const veiculos = q ? tabelaHash.buscarParcial(q) : filaVeiculos.listar();

    res.render('veiculos', { veiculos, q, erro });
  });
});

// ==================================
// Rota: Página de Adicionar Veículo
// ==================================
router.get('/adicionar', (req, res) => {
  res.render('adicionar_veiculo');
});

// ==================================
// Rota: Adicionar Veículo (POST)
// ==================================
router.post('/', (req, res) => {
  const { modelo, ano, placa, capacidade, revisao_km, status } = req.body;

  const sql = `
    INSERT INTO veiculos (modelo, ano, placa, capacidade, revisao_km, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [modelo, ano, placa, capacidade, revisao_km, status];

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Erro ao adicionar veículo:', err);
      return res.status(500).send('Erro ao adicionar veículo');
    }
    res.redirect('/veiculos');
  });
});

// ==================================
// Rota: Deletar Veículo
// ==================================
router.post('/:id/delete', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM veiculos WHERE idVeiculos = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Erro ao deletar veículo:', err);
      // Redireciona com erro
      return res.redirect('/veiculos?erro=1');
    }

    res.redirect('/veiculos');
  });
});
// Buscar veículos (autocomplete)
router.get('/buscar', (req, res) => {
  const termo = req.query.q || '';
  const sql = `SELECT idVeiculos, modelo, placa FROM veiculos WHERE modelo LIKE ? OR placa LIKE ? LIMIT 10`;

  db.query(sql, [`%${termo}%`, `%${termo}%`], (err, results) => {
    if (err) {
      console.error('Erro ao buscar veículos:', err);
      return res.status(500).json({ erro: 'Erro ao buscar veículos' });
    }
    res.json(results);
  });
});
module.exports = router;
