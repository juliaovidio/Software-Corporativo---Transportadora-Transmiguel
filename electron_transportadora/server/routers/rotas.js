const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================
// LISTAR ROTAS COM JOINs
// ==========================
router.get('/', (req, res) => {
  const search = req.query.q || '';

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
      v.placa AS placa_veiculo,
      f.nome AS nome_funcionario
    FROM trajetos t
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    JOIN funcionarios f ON t.funcionarios_idFuncionarios = f.idFuncionarios
    WHERE 
      r.endereco_origem LIKE ? OR 
      r.endereco_destino LIKE ? OR 
      v.placa LIKE ? OR 
      f.nome LIKE ? OR
      t.tipo LIKE ?
    ORDER BY t.data DESC;
  `;

  const searchValue = `%${search}%`;

  db.query(query, [searchValue, searchValue, searchValue, searchValue, searchValue], (err, results) => {
    if (err) {
      console.error('Erro ao buscar rotas:', err);
      return res.status(500).send('Erro ao buscar rotas');
    }
    res.render('rotas', { rotas: results, q: search });
  });
});

// ==========================
// PÁGINA PARA ADICIONAR ROTA
// ==========================
router.get('/adicionar', (req, res) => {
  res.render('adicionar_rota');
});

// ==========================
// INSERIR NOVA ROTA
// ==========================
router.post('/', (req, res) => {
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

      const sqlRota = `
        INSERT INTO rotas (endereco_origem, endereco_destino, distancia)
        VALUES (?, ?, ?)
      `;
      db.query(sqlRota, [endereco_origem, endereco_destino, distancia], (err, rotaRes) => {
        if (err) return res.status(500).send('Erro ao inserir rota');

        const idRota = rotaRes.insertId;

        const sqlTrajeto = `
          INSERT INTO trajetos (
            data, hora_saida, hora_chegada, tipo, frequencia, descricao,
            veiculos_idVeiculos, rotas_idRotas, funcionarios_idFuncionarios
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlTrajeto, [
          data, hora_saida, hora_chegada, tipo, frequencia, descricao,
          idVeic, idRota, idFunc
        ], (err) => {
          if (err) return res.status(500).send('Erro ao inserir trajeto');
          res.redirect('/rotas');
        });
      });
    });
  });
});

// ==========================
// DELETAR ROTA (com confirmação no EJS)
// ==========================
router.post('/:id/delete', (req, res) => {
  const { id } = req.params;

  // Excluir primeiro da tabela trajetos, depois da tabela rotas
  const sqlTrajeto = 'DELETE FROM trajetos WHERE idTrajetos = ?';
  db.query(sqlTrajeto, [id], (err) => {
    if (err) {
      console.error('Erro ao deletar trajeto:', err);
      return res.redirect('/rotas'); // apenas volta sem mensagem
    }

    // Depois apaga a rota associada (se quiser limpar também)
    const sqlRota = `
      DELETE FROM rotas 
      WHERE idRotas NOT IN (SELECT DISTINCT rotas_idRotas FROM trajetos)
    `;
    db.query(sqlRota, (err2) => {
      if (err2) console.error('Erro ao limpar rotas órfãs:', err2);
      res.redirect('/rotas');
    });
  });
});

module.exports = router;
