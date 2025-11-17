const express = require('express');
const router = express.Router();
const db = require('../db'); // ajuste o caminho do seu db.js

// GET /paginicial
router.get('/', (req, res) => {
  db.query('SELECT * FROM vw_atividades', (err, results) => {
    if (err) {
      console.error(err);
      return res.send('Erro ao carregar atividades');
    }

    // Envia atividades para a view
    res.render('paginicial', { atividades: results });
  });
});

module.exports = router;
