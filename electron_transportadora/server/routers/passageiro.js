const express = require('express');
const router = express.Router();
const db = require('../db');

const { Fila } = require('../queue/passageiroFila');
const { TabelaHash } = require('../queue/passageiroHash');

const filaPassageiros = new Fila();
const tabelaHash = new TabelaHash();

// ======================
// LISTAR PASSAGEIROS
// ======================
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  let sql = 'SELECT * FROM passageiro';
  const params = [];

  if (q) {
    sql += ' WHERE nome LIKE ? OR email LIKE ?';
    params.push(`%${q}%`, `%${q}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar passageiros:', err);
      return res.status(500).send('Erro no banco de dados');
    }

    filaPassageiros.limpar();
    results.forEach(p => filaPassageiros.enqueue(p));

    tabelaHash.limpar();
    results.forEach(p => tabelaHash.adicionar(p));

    const clientes = q ? tabelaHash.buscarParcial(q) : filaPassageiros.listar();

    res.render('passageiro', { clientes, q });
  });
});

// ======================
// FORMULÁRIO DE ADIÇÃO
// ======================
router.get('/adicionar', (req, res) => {
  db.query('SELECT idTrajetos, descricao FROM trajetos', (err, trajetos) => {
    if (err) {
      console.error('Erro ao buscar trajetos:', err);
      return res.status(500).send('Erro ao buscar trajetos');
    }
    res.render('adicionar_passageiro', { trajetos });
  });
});

// ======================
// INSERIR NOVO PASSAGEIRO
// ======================
router.post('/', (req, res) => {
  const {
    nome, telefone, email, endereco, bairro, cidade,
    tipo, cpf, cnpj, valor_mensal, status, trajetos_idTrajetos
  } = req.body;

  const trajetoId = parseInt((trajetos_idTrajetos || '').split(' - ')[0]) || null;

  const sql = `
    INSERT INTO passageiro 
    (nome, telefone, email, endereco, bairro, cidade, tipo, cpf, cnpj, valor_mensal, status, trajetos_idTrajetos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nome, telefone, email, endereco, bairro, cidade,
    tipo, cpf || null, cnpj || null, valor_mensal || 0, status || null, trajetoId
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('Erro ao inserir passageiro:', err);
      return res.status(500).send('Erro ao salvar passageiro');
    }
    res.redirect('/passageiro');
  });
});

// ======================
// DELETAR PASSAGEIRO
// ======================
router.post('/:id/delete', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM passageiro WHERE idPassageiro = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Erro ao deletar passageiro:', err);
      return res.redirect('/passageiro'); // apenas volta, sem mensagem
    }
    res.redirect('/passageiro');
  });
});

module.exports = router;
