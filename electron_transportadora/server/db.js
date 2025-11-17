const mysql = require('mysql2')

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jdocema123456@',
    database: 'banco_locomoção'
})
conexao.connect((err)=>{
    if(err) throw err
    console.log('Conectado com sucesso ao banco de dados')
})
module.exports = conexao