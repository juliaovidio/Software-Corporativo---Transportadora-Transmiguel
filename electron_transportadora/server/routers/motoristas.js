const express = require('express');
const router = express.Router();
const db = require('../db'); // conexão MySQL

// =======================================
// LISTAR MOTORISTAS (usando a view vw_visualizacao_motorista)
// =======================================
router.get('/', (req, res) => {
  const search = req.query.q || '';

  // Consulta base
  let sql = `
    SELECT 
      idTrajetos,
      data,
      hora_saida,
      hora_chegada,
      tipo,
      frequencia,
      endereco_origem,
      endereco_destino,
      distancia,
      modelo_veiculo,
      placa_veiculo,
      nome_funcionario
    FROM vw_vizualizacao_motorista
  `;

  const params = [];

  // Se houver texto de busca, aplica filtro
  if (search) {
    sql += `
      WHERE 
        nome_funcionario LIKE ? OR
        endereco_origem LIKE ? OR
        endereco_destino LIKE ? OR
        modelo_veiculo LIKE ? OR
        placa_veiculo LIKE ? OR
        tipo LIKE ?
    `;
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar motoristas:', err);
      return res.status(500).send('Erro ao buscar motoristas');
    }

  const motoristas = results.map(m => {
  let dataFormatada = '';
  if (m.data) { // só formata se houver valor
    const d = new Date(m.data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    dataFormatada = `${dia}-${mes}-${ano}`;
  }
  return {
    ...m,
    dataFormatada
  };
});


    res.render('motorista', { motoristas, q: search });
  });
});

// =======================================
// AUTOCOMPLETE / BARRA DE PESQUISA AJAX
// =======================================
router.get('/buscar', (req, res) => {
  const q = `%${req.query.q || ''}%`;

  const sql = `
    SELECT 
      CONCAT(
        nome_funcionario, ' | ',
        modelo_veiculo, ' | ',
        placa_veiculo, ' | ',
        endereco_origem, ' → ', endereco_destino
      ) AS motorista_text
    FROM vw_vizualizacao_motorista
    WHERE 
      nome_funcionario LIKE ? OR
      endereco_origem LIKE ? OR
      endereco_destino LIKE ? OR
      modelo_veiculo LIKE ? OR
      placa_veiculo LIKE ? OR
      tipo LIKE ?
    LIMIT 10
  `;

  db.query(sql, [q, q, q, q, q, q], (err, results) => {
    if (err) {
      console.error('Erro ao buscar motoristas (autocomplete):', err);
      return res.status(500).json([]);
    }

    const motoristas = results.map(r => r.motorista_text);
    res.json(motoristas);
  });
});

module.exports = router;
