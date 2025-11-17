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

    // Limpa e popula a fila
    filaVeiculos.limpar();
    results.forEach(v => filaVeiculos.enqueue(v));

    // Limpa e popula a hash
    tabelaHash.limpar();
    results.forEach(v => tabelaHash.adicionar(v));

    let veiculos = [];

    if (q) {
      veiculos = tabelaHash.buscarParcial(q);
    } else {
      veiculos = filaVeiculos.listar();
    }

    res.render('veiculos', { veiculos, q });
  });
});

// ==================================
// Rota: Página de Adicionar Veículo
// ==================================
router.get('/adicionar', (req, res) => {
  res.render('adicionar_veiculo');
});

// ==================================
// Rota: Adicionar Novo Veículo
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
      return res.status(500).send('Erro no banco de dados');
    }
    res.redirect('/veiculos');
  });
});

// ==================================
// Rota: Página de Edição de Veículo
// ==================================
router.get('/editar/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM veiculos WHERE idVeiculos = ? LIMIT 1';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar veículo:', err);
      return res.status(500).send('Erro ao buscar veículo');
    }

    if (results.length === 0) {
      return res.status(404).send('Veículo não encontrado');
    }

    res.render('editar_veiculo', { veiculo: results[0] });
  });
});

// ==================================
// Rota: Atualizar Veículo
// ==================================
router.post('/editar/:id', (req, res) => {
  const { id } = req.params;
  const { modelo, ano, placa, capacidade, revisao_km, status } = req.body;

  const sql = `
    UPDATE veiculos
    SET modelo = ?, ano = ?, placa = ?, capacidade = ?, revisao_km = ?, status = ?
    WHERE idVeiculos = ?
  `;
  const params = [modelo, ano, placa, capacidade, revisao_km, status, id];

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Erro ao atualizar veículo:', err);
      return res.status(500).send('Erro ao atualizar veículo');
    }

    res.redirect('/veiculos');
  });
});

module.exports = router;
