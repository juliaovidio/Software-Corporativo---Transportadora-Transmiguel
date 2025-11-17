const express = require('express');
const router = express.Router();
const db = require('../db');

const { Fila } = require('../queue/passageiroFila');
const { TabelaHash } = require('../queue/passageiroHash');

const filaPassageiros = new Fila();
const tabelaHash = new TabelaHash();

/**
 * FORMULÁRIO DE EDIÇÃO
 * (Exibe o passageiro atual + lista de trajetos)
 */
router.get('/editar/:id', (req, res) => {
  const { id } = req.params;

  const passageiroQuery = 'SELECT * FROM passageiro WHERE idPassageiro = ?';
  const trajetosQuery = 'SELECT idTrajetos, descricao FROM trajetos';

  db.query(passageiroQuery, [id], (err, passageiroResult) => {
    if (err) {
      console.error('Erro ao buscar passageiro:', err);
      return res.status(500).send('Erro ao buscar passageiro');
    }

    if (passageiroResult.length === 0) {
      return res.status(404).send('Passageiro não encontrado');
    }

    db.query(trajetosQuery, (err, trajetos) => {
      if (err) {
        console.error('Erro ao buscar trajetos:', err);
        return res.status(500).send('Erro ao buscar trajetos');
      }

      res.render('editar_passageiro', {
        passageiro: passageiroResult[0],
        trajetos
      });
    });
  });
});

/**
 * ATUALIZAR PASSAGEIRO
 * (Recebe os dados do formulário e atualiza no banco)
 */
router.post('/editar/:id', (req, res) => {
  const { id } = req.params;
  const {
    nome, telefone, email, endereco, bairro, cidade,
    tipo, cpf, cnpj, valor_mensal, status, trajetos_idTrajetos
  } = req.body;

  const trajetoId = parseInt((trajetos_idTrajetos || '').split(' - ')[0]) || null;

  const sql = `
    UPDATE passageiro
    SET nome = ?, telefone = ?, email = ?, endereco = ?, bairro = ?, cidade = ?,
        tipo = ?, cpf = ?, cnpj = ?, valor_mensal = ?, status = ?, trajetos_idTrajetos = ?
    WHERE idPassageiro = ?
  `;

  const values = [
    nome, telefone, email, endereco, bairro, cidade,
    tipo, cpf || null, cnpj || null, valor_mensal || 0, status || null, trajetoId, id
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar passageiro:', err);
      return res.status(500).send('Erro ao atualizar passageiro');
    }

    // Atualiza filas e hash (opcional, se você usa em cache)
    db.query('SELECT * FROM passageiro', (err, results) => {
      if (!err) {
        filaPassageiros.limpar();
        tabelaHash.limpar();
        results.forEach(p => {
          filaPassageiros.enqueue(p);
          tabelaHash.adicionar(p);
        });
      }
    });

    res.redirect('/passageiro');
  });
});

module.exports = router;
