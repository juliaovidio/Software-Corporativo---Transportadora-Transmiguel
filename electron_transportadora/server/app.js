const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const db = require('./db'); // conexão com banco

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../renderer/views'));
app.use(express.static(path.join(__dirname, '../renderer/public')));
app.use(express.urlencoded({ extended: false }));

// Sessão
app.use(session({
    secret: 'segredo-super-seguro',
    resave: false,
    saveUninitialized: false,
}));

// Disponibiliza o usuário logado para todas as views/partials
app.use((req, res, next) => {
  res.locals.funcionarios = req.session.usuario ? {
    nome: req.session.nome,
    email: req.session.usuario,
    cargo: req.session.cargo
  } : null;
  next();
});

// Rotas
const authRouter = require('./routers/auth');
const paginicialRouter = require('./routers/paginicial');
const passageiroRouter = require('./routers/passageiro');
const funcionarioRouter = require('./routers/funcionario');
const veiculosRouter = require('./routers/veiculos');
const editarRotaRouter = require('./routers/editar_rota');
const rotaRouter = require('./routers/rotas');
const financeiroRotaRouter = require('./routers/financeiro_rota');
const financeiroPassageiroRouter = require('./routers/financeiro_passageiro');
const relatorioRotaRouter = require('./routers/relatorio_rota');
const relatorioPagamentoRouter = require('./routers/relatorio_pagamento');
const motoristasRouter = require('./routers/motoristas');
const editarPassageiroRouter = require('./routers/editar_passageiro');
const editarVeiculoRouter = require('./routers/editar_veiculo');




app.use('/', authRouter);
app.use('/paginicial', paginicialRouter);
app.use('/passageiro', passageiroRouter); 
app.use('/funcionarios', funcionarioRouter);
app.use('/veiculos', veiculosRouter);
app.use('/rotas', rotaRouter);
app.use('/rotas', editarRotaRouter);
app.use('/financeiro_rota', financeiroRotaRouter);
app.use('/financeiro_passageiro', financeiroPassageiroRouter);
app.use('/relatorio_rota', relatorioRotaRouter);
app.use('/relatorio_pagamento', relatorioPagamentoRouter);
app.use('/motoristas', motoristasRouter);
app.use('/passageiro', editarPassageiroRouter);
app.use('/veiculos', editarVeiculoRouter);




// Login
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/relatorio', (req, res) => {
  res.render('relatorio');
});

app.get('/financeiro', (req, res) => {
  res.render('financeiro_inicial');
});


// Inicia servidor
app.listen(4040, () => {
  console.log('Servidor inicializado com sucesso em http://localhost:4040');
});
