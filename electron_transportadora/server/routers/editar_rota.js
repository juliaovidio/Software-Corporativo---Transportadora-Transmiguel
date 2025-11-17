const express = require('express');
const router = express.Router();
const db = require('../db'); // conexão com MySQL

// ==========================
// FORMULÁRIO DE EDIÇÃO DE ROTA
// ==========================
router.get('/editar/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      r.idRotas,
      r.endereco_origem,
      r.endereco_destino,
      r.distancia,
      t.idTrajetos,
      t.data,
      t.hora_saida,
      t.hora_chegada,
      t.tipo,
      t.frequencia,
      t.descricao,
      v.idVeiculos,
      v.modelo,
      v.placa,
      f.idFuncionarios,
      f.nome AS nome_funcionario
    FROM trajetos t
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    JOIN funcionarios f ON t.funcionarios_idFuncionarios = f.idFuncionarios
    WHERE r.idRotas = ?;
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar rota');
    if (results.length === 0) return res.status(404).send('Rota não encontrada');

    const rota = results[0];

    // Buscar listas para autocomplete (caso queira usar sem fetch)
    const sqlFuncs = 'SELECT nome FROM funcionarios';
    const sqlVeics = 'SELECT modelo, placa FROM veiculos';

    db.query(sqlFuncs, (err, listaFuncionarios) => {
      if (err) return res.status(500).send('Erro ao buscar funcionários');

      db.query(sqlVeics, (err, listaVeiculos) => {
        if (err) return res.status(500).send('Erro ao buscar veículos');

        // NÃO passar explicitamente "funcionarios" aqui — deixamos o middleware em app.js
        // popular res.locals.funcionarios. Assim o partial do menu lê corretamente.
        res.render('editar_rota', {
          rota,
          listaFuncionarios,
          listaVeiculos
        });
      });
    });
  });
});

// ==========================
// ATUALIZAR ROTA EXISTENTE
// ==========================
router.post('/editar/:id', (req, res) => {
  const { id } = req.params;
  const {
    endereco_origem,
    endereco_destino,
    distancia,
    data,
    hora_saida,
    hora_chegada,
    tipo,
    frequencia,
    descricao,
    funcionario,
    modelo,
    placa
  } = req.body;

  // Buscar IDs de FK
  const sqlFuncionario = `SELECT idFuncionarios FROM funcionarios WHERE nome = ? LIMIT 1`;
  const sqlVeiculo = `SELECT idVeiculos FROM veiculos WHERE modelo = ? AND placa = ? LIMIT 1`;

  db.query(sqlFuncionario, [funcionario], (err, funcRes) => {
    if (err) return res.status(500).send('Erro ao buscar funcionário');
    if (funcRes.length === 0) return res.status(400).send('Funcionário não encontrado');

    const idFunc = funcRes[0].idFuncionarios;

    db.query(sqlVeiculo, [modelo, placa], (err, veicRes) => {
      if (err) return res.status(500).send('Erro ao buscar veículo');
      if (veicRes.length === 0) return res.status(400).send('Veículo não encontrado');

      const idVeic = veicRes[0].idVeiculos;

      // Atualizar tabela rotas
      const sqlUpdateRota = `
        UPDATE rotas
        SET endereco_origem = ?, endereco_destino = ?, distancia = ?
        WHERE idRotas = ?
      `;
      db.query(sqlUpdateRota, [endereco_origem, endereco_destino, distancia, id], (err) => {
        if (err) return res.status(500).send('Erro ao atualizar rota');

        // Atualizar tabela trajetos associada a esta rota
        const sqlUpdateTrajeto = `
          UPDATE trajetos
          SET 
            data = ?, hora_saida = ?, hora_chegada = ?, tipo = ?, 
            frequencia = ?, descricao = ?, 
            veiculos_idVeiculos = ?, funcionarios_idFuncionarios = ?
          WHERE rotas_idRotas = ?
        `;
        db.query(sqlUpdateTrajeto, [
          data, hora_saida, hora_chegada, tipo, frequencia, descricao,
          idVeic, idFunc, id
        ], (err) => {
          if (err) return res.status(500).send('Erro ao atualizar trajeto');

          res.redirect('/rotas');
        });
      });
    });
  });
});
router.get('/teste', (req, res) => {
  res.send('✅ editar_rota.js ativo!');
});

module.exports = router;