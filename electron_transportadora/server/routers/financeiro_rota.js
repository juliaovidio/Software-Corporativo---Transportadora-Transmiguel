const express = require('express');
const router = express.Router();
const db = require('../db'); // conexão MySQL

// =======================================
// LISTAR FINANCEIROS COM JOINs
// =======================================
router.get('/', (req, res) => {
  const search = req.query.q || '';

  const query = `
    SELECT 
      f.idfinanceiro_trajeto,
      f.valor_pedagio,
      f.preco_km,
      f.custo_motorista,
      f.valor_total_passageiros,
      f.lucro,
      t.idTrajetos,
      r.endereco_origem,
      r.endereco_destino,
      v.modelo AS modelo_veiculo,
      v.placa AS placa_veiculo,
      func.nome AS nome_funcionario
    FROM financeiro_trajeto f
    JOIN trajetos t ON f.trajetos_idTrajetos = t.idTrajetos
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    JOIN funcionarios func ON t.funcionarios_idFuncionarios = func.idFuncionarios
    WHERE 
      r.endereco_origem LIKE ? OR 
      r.endereco_destino LIKE ? OR 
      v.modelo LIKE ? OR 
      v.placa LIKE ? OR 
      func.nome LIKE ?
  `;

  const searchValue = `%${search}%`;

  db.query(
    query,
    [searchValue, searchValue, searchValue, searchValue, searchValue],
    (err, results) => {
      if (err) {
        console.error('Erro ao buscar relatórios financeiros:', err);
        return res.status(500).send('Erro ao buscar relatórios financeiros');
      }
      res.render('financeiro_rota', { relatorios: results, q: search });
    }
  );
});

// =======================================
// PÁGINA PARA ADICIONAR FINANCEIRO
// =======================================
router.get('/adicionar', (req, res) => {
  res.render('adicionar_f_rota');
});

// =======================================
// INSERIR NOVO REGISTRO FINANCEIRO
// =======================================
router.post('/', (req, res) => {
  const {
    valor_pedagio,
    preco_km,
    custo_motorista,
    valor_total_passageiros,
    lucro,
    trajeto, // descrição visível (fallback)
    trajetos_idTrajetos // id vindo do input hidden (preferível)
  } = req.body;

  // Função para inserir usando idTrajeto
  const proceedInsert = (idTrajeto) => {
    const sqlInsert = `
      INSERT INTO financeiro_trajeto (
        valor_pedagio, preco_km, custo_motorista, valor_total_passageiros, lucro, trajetos_idTrajetos
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sqlInsert,
      [valor_pedagio, preco_km, custo_motorista, valor_total_passageiros, lucro, idTrajeto],
      (err) => {
        if (err) {
          console.error('Erro ao inserir relatório financeiro:', err);
          return res.status(500).send('Erro ao inserir relatório financeiro');
        }
        res.redirect('/financeiro_rota');
      }
    );
  };

  // Se veio o id do trajeto (campo hidden), usamos diretamente após validação
  const idFromHidden = trajetos_idTrajetos ? Number(trajetos_idTrajetos) : null;
  if (idFromHidden) {
    // valida se existe
    db.query('SELECT idTrajetos FROM trajetos WHERE idTrajetos = ? LIMIT 1', [idFromHidden], (err, rows) => {
      if (err) {
        console.error('Erro ao validar trajeto por id:', err);
        return res.status(500).send('Erro ao validar trajeto');
      }
      if (!rows.length) return res.status(400).send('Trajeto não encontrado pelo id');
      proceedInsert(idFromHidden);
    });
    return;
  }

  // Fallback: tentar buscar pelo texto completo (igual ao que aparece no input)
  const sqlTrajeto = `
    SELECT t.idTrajetos
    FROM trajetos t
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    JOIN funcionarios func ON t.funcionarios_idFuncionarios = func.idFuncionarios
    WHERE CONCAT(r.endereco_origem, ' → ', r.endereco_destino, ' | ', v.modelo, ' | ', v.placa) = ?
    LIMIT 1
  `;

  db.query(sqlTrajeto, [trajeto], (err, result) => {
    if (err) {
      console.error('Erro ao buscar trajeto por texto:', err);
      return res.status(500).send('Erro ao buscar trajeto');
    }
    if (result.length === 0) {
      return res.status(400).send('Trajeto não encontrado');
    }

    const idTrajeto = result[0].idTrajetos;
    proceedInsert(idTrajeto);
  });
});

// =======================================
// ROTA AUXILIAR - BUSCAR TRAJETOS (autocomplete)
// retorna [{ id, descricao }, ...]
// =======================================
router.get('/trajetos/buscar', (req, res) => {
  const q = `%${req.query.q || ''}%`;

  const sql = `
    SELECT 
      t.idTrajetos AS id,
      CONCAT(r.endereco_origem, ' → ', r.endereco_destino, ' | ', v.modelo, ' | ', v.placa) AS descricao
    FROM trajetos t
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    WHERE r.endereco_origem LIKE ? OR r.endereco_destino LIKE ? OR v.modelo LIKE ? OR v.placa LIKE ?
    LIMIT 10
  `;

  db.query(sql, [q, q, q, q], (err, results) => {
    if (err) {
      console.error('Erro buscar trajetos autocomplete:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

// =======================================
// EDITAR FINANCEIRO (GET)
// =======================================
router.get('/editar/:id', (req, res) => {
  const id = req.params.id;

  // Busca o financeiro específico
  const sqlFinanceiro = `
    SELECT 
      f.*,
      t.idTrajetos,
      CONCAT(r.endereco_origem, ' → ', r.endereco_destino, ' | ', v.modelo, ' | ', v.placa) AS descricao_trajeto
    FROM financeiro_trajeto f
    JOIN trajetos t ON f.trajetos_idTrajetos = t.idTrajetos
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    WHERE f.idFinanceiro_trajeto = ?
  `;

  const sqlTrajetos = `
    SELECT 
      t.idTrajetos AS id,
      CONCAT(r.endereco_origem, ' → ', r.endereco_destino, ' | ', v.modelo, ' | ', v.placa) AS descricao
    FROM trajetos t
    JOIN rotas r ON t.rotas_idRotas = r.idRotas
    JOIN veiculos v ON t.veiculos_idVeiculos = v.idVeiculos
    ORDER BY r.endereco_origem
  `;

  db.query(sqlFinanceiro, [id], (err, financeiroResults) => {
    if (err) {
      console.error('Erro ao buscar financeiro:', err);
      return res.status(500).send('Erro ao buscar registro financeiro');
    }

    if (financeiroResults.length === 0) {
      return res.status(404).send('Registro financeiro não encontrado');
    }

    const financeiro = financeiroResults[0];

    // Busca os trajetos para popular o select
    db.query(sqlTrajetos, (err, trajetos) => {
      if (err) {
        console.error('Erro ao buscar trajetos:', err);
        return res.status(500).send('Erro ao carregar trajetos');
      }

      res.render('editar_f_rota', {
        financeiro,
        trajetos
      });
    });
  });
});

// =======================================
// EDITAR FINANCEIRO (POST - Atualização)
// =======================================
router.post('/editar/:id', (req, res) => {
  const id = req.params.id;
  const {
    valor_pedagio,
    preco_km,
    custo_motorista,
    valor_total_passageiros,
    lucro,
    trajetos_idTrajetos
  } = req.body;

  if (!trajetos_idTrajetos) {
    return res.status(400).send('Selecione um trajeto válido.');
  }

  const sqlUpdate = `
    UPDATE financeiro_trajeto
    SET 
      valor_pedagio = ?,
      preco_km = ?,
      custo_motorista = ?,
      valor_total_passageiros = ?,
      lucro = ?,
      trajetos_idTrajetos = ?
    WHERE idFinanceiro_trajeto = ?
  `;

  db.query(
    sqlUpdate,
    [
      valor_pedagio,
      preco_km,
      custo_motorista,
      valor_total_passageiros,
      lucro,
      trajetos_idTrajetos,
      id
    ],
    (err) => {
      if (err) {
        console.error('Erro ao atualizar registro financeiro:', err);
        return res.status(500).send('Erro ao atualizar registro financeiro');
      }
      res.redirect('/financeiro_rota');
    }
  );
});

module.exports = router;
