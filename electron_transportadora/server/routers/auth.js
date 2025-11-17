

const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.query(
    `SELECT f.idFuncionarios, f.nome, f.email, f.senha, c.tipo AS cargo
     FROM funcionarios f
     JOIN cargo c ON f.cargo_idCargo = c.idCargo
     WHERE f.email = ?`,
    [email],
    (err, results) => {
      if (err) {
        console.error("Erro no banco:", err);
        return res.render('login', { erroEmail: '', erroSenha: 'Erro no servidor' });
      }

      if (results.length === 0) {
        // Email não existe
        return res.render('login', { erroEmail: 'Email inválido', erroSenha: '' });
      }

      const funcionario = results[0];

      // Hash SHA-256 da senha digitada
      const hashDigitado = crypto.createHash('sha256').update(senha).digest('hex');

      if (hashDigitado !== funcionario.senha) {
        // Senha incorreta
        return res.render('login', { erroEmail: '', erroSenha: 'Senha incorreta' });
      }

      // Login OK: salvar sessão
      req.session.usuario = funcionario.email;
      req.session.nome = funcionario.nome;
      req.session.cargo = funcionario.cargo;

      // Redirecionar conforme cargo
      switch (funcionario.cargo) {
        case 'Gerente': return res.redirect('/paginicial');
        case 'Motorista': return res.redirect('/motoristas');
        case 'Secretário': return res.redirect('/paginicial');
        default: return res.redirect('/paginicial  ');
      }
    }
  );
});

module.exports = router;
