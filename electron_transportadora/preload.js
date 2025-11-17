//conecao 
const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Aqui você pode expor funções ou objetos para o contexto da janela
});