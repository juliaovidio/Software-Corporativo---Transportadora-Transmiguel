const express = require('express');
const router = express.Router();
const db = require('../db'); // ajuste o caminho se necessário

// LISTAGEM: GET /financeiro_passageiro/
router.get('/', (req, res) => {
  console.log('GET /financeiro_passageiro/ recebido');
  const q = (req.query.q || '').trim();

  const sql = `
    SELECT 
      p.idPagamento_passageiro,
      p.data AS data,
      p.forma_pagamento,
      p.valor_pago,
      p.status,
      ps.nome AS nome
    FROM pagamento_passageiro p
    JOIN passageiro ps ON p.passageiro_idPassageiro = ps.idPassageiro
    WHERE 
      ps.nome LIKE ? OR
      p.forma_pagamento LIKE ? OR
      p.status LIKE ?
    ORDER BY p.data DESC;
  `;

  const search = `%${q}%`;

  db.query(sql, [search, search, search], (err, results) => {
    if (err) {
      console.error('Erro ao buscar relatórios financeiros:', err);
      return res.status(500).send('Erro ao buscar relatórios financeiros');
    }

    res.render('financeiro_passageiro', { pagamentos: results, query: q });
  });
});

router.get('/api/passageiros', (req, res) => {
  const term = (req.query.term || '').trim();
  const search = `%${term}%`;

  const sql = `
    SELECT p.idPassageiro, p.nome, t.descricao AS rota
    FROM passageiro p
    LEFT JOIN trajetos t ON p.trajetos_idTrajetos = t.idTrajetos
    WHERE p.nome LIKE ?
    ORDER BY p.nome
    LIMIT 10
  `;

  db.query(sql, [search], (err, results) => {
    if (err) {
      console.error('Erro ao buscar passageiros (autocomplete):', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});


// FORMULÁRIO ADICIONAR: GET /financeiro_passageiro/adicionar
router.get('/adicionar', (req, res) => {
  console.log('GET /financeiro_passageiro/adicionar recebido');
  res.render('adicionar_f_passageiro');
});

// INSERIR: POST /financeiro_passageiro/adicionar
router.post('/adicionar', (req, res) => {
  const { passageiro_idPassageiro, data, forma_pagamento, valor_pago, status } = req.body;

  if (!passageiro_idPassageiro) {
    return res.status(400).send('Selecione um passageiro válido.');
  }

  const sql = `
    INSERT INTO pagamento_passageiro 
    (passageiro_idPassageiro, data, forma_pagamento, valor_pago, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [passageiro_idPassageiro, data, forma_pagamento, valor_pago, status], (err) => {
    if (err) {
      console.error('Erro ao adicionar pagamento:', err);
      return res.status(500).send('Erro ao adicionar pagamento');
    }

    res.redirect('/financeiro_passageiro');
  });
});

// EDITAR / ATUALIZAR / EXCLUIR (rotas relativas)
router.get('/editar/:id', (req, res) => {
  const id = req.params.id;
  const sqlPagamento = 'SELECT * FROM pagamento_passageiro WHERE idPagamento_passageiro = ?';
  const sqlPassageiros = 'SELECT idPassageiro, nome FROM passageiro';
  db.query(sqlPagamento, [id], (err, pagamentoResults) => {
    if (err) {
      console.error('Erro ao buscar pagamento:', err);
      return res.status(500).send('Erro ao buscar pagamento');
    }
    db.query(sqlPassageiros, (err, passageiros) => {
      if (err) {
        console.error('Erro ao buscar passageiros:', err);
        return res.status(500).send('Erro ao carregar passageiros');
      }
      res.render('editar_f_passageiro', {
        pagamento: pagamentoResults[0],
        passageiros
      });
    });
  });
});

router.post('/editar/:id', (req, res) => {
  const id = req.params.id;
  const { passageiro_idPassageiro, data, forma_pagamento, valor_pago, status } = req.body;
  const sql = `
    UPDATE pagamento_passageiro 
    SET passageiro_idPassageiro = ?, data = ?, forma_pagamento = ?, valor_pago = ?, status = ?
    WHERE idPagamento_passageiro = ?
  `;
  db.query(sql, [passageiro_idPassageiro, data, forma_pagamento, valor_pago, status, id], (err) => {
    if (err) {
      console.error('Erro ao atualizar pagamento:', err);
      return res.status(500).send('Erro ao atualizar pagamento');
    }
    res.redirect('/financeiro_passageiro');
  });
});

router.get('/excluir/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM pagamento_passageiro WHERE idPagamento_passageiro = ?', [id], (err) => {
    if (err) {
      console.error('Erro ao excluir pagamento:', err);
      return res.status(500).send('Erro ao excluir pagamento');
    }
    res.redirect('/financeiro_passageiro');
  });
});
// EDITAR: GET /financeiro_passageiro/editar/:id
router.get('/editar/:id', (req, res) => {
  const id = req.params.id;

  const sqlPagamento = `
    SELECT * 
    FROM pagamento_passageiro 
    WHERE idPagamento_passageiro = ?
  `;

  const sqlPassageiros = `
    SELECT idPassageiro, nome 
    FROM passageiro
  `;

  // Busca o pagamento a ser editado
  db.query(sqlPagamento, [id], (err, pagamentoResults) => {
    if (err) {
      console.error('Erro ao buscar pagamento:', err);
      return res.status(500).send('Erro ao buscar pagamento');
    }

    if (pagamentoResults.length === 0) {
      return res.status(404).send('Pagamento não encontrado');
    }

    // Busca lista de passageiros para o select no formulário
    db.query(sqlPassageiros, (err, passageiros) => {
      if (err) {
        console.error('Erro ao buscar passageiros:', err);
        return res.status(500).send('Erro ao carregar passageiros');
      }

      res.render('editar_financeiro_passageiro', {
        pagamento: pagamentoResults[0],
        passageiros
      });
    });
  });
});


// EDITAR: POST /financeiro_passageiro/editar/:id
router.post('/editar/:id', (req, res) => {
  const id = req.params.id;
  const { passageiro_idPassageiro, data, forma_pagamento, valor_pago, status } = req.body;

  if (!passageiro_idPassageiro) {
    return res.status(400).send('Selecione um passageiro válido.');
  }

  const sql = `
    UPDATE pagamento_passageiro 
    SET passageiro_idPassageiro = ?, 
        data = ?, 
        forma_pagamento = ?, 
        valor_pago = ?, 
        status = ?
    WHERE idPagamento_passageiro = ?
  `;

  db.query(sql, [passageiro_idPassageiro, data, forma_pagamento, valor_pago, status, id], (err) => {
    if (err) {
      console.error('Erro ao atualizar pagamento:', err);
      return res.status(500).send('Erro ao atualizar pagamento');
    }

    res.redirect('/financeiro_passageiro');
  });
});


module.exports = router;