# Software-Corporativo---Transportadora-Transmiguel
Foi desenvolvido um projeto de software corporativo para a empresa de transporte Transmiguel, localizada em Jacutinga–MG. O objetivo do sistema é aprimorar a organização interna, abrangendo o controle de passageiros, rotas, veículos e processos financeiros.

## Instruções de uso

Este README descreve como configurar o ambiente de desenvolvimento do projeto electron_transportadora para que a aplicação rode corretamente em sua máquina.

## Pré-requisitos
Antes de começar, verifique se você tem instalado:

- Node.js (versão estável mais recente recomendada — exemplo usado: *v22.14.0*)  
  Site oficial: https://nodejs.org
- Visual Studio Code (ou outro editor de sua preferência)  
  Site oficial: https://code.visualstudio.com

> Observação: a pasta node_modules não é incluída no compartilhamento do projeto (por ser grande e específica por sistema). Cada desenvolvedor deve instalar as dependências localmente.

## Passo a passo — Configuração do projeto

1. Abra a pasta do projeto no Visual Studio Code (ou no seu editor).
2. Abra o terminal na raiz do projeto. No VS Code o atalho é: `Ctrl + ` (crase).
3. Instale todas as dependências com o comando:
   npm install
   O que esse comando faz:
   - Lê package.json (e package-lock.json) e baixa todas as bibliotecas necessárias.
   - Cria a pasta node_modules localmente com as dependências de produção e desenvolvimento.

5. Execute a aplicação:
   npm start
   Esse comando inicializa a aplicação Electron e permite executar o projeto.

## Observações importantes
- Não é necessário executar npm init -y, pois o arquivo package.json já está presente no repositório.
- Para adicionar novas dependências:
  - Dependência de produção:
    npm install <nome-da-dependência>
  - Dependência de desenvolvimento:
    npm install <nome-da-dependência> --save-dev
- Caso encontre problemas específicos ao sistema operacional, verifique se a versão do Node.js é compatível e consulte a documentação da dependência que apresentar erro.

## Resultado esperado
Seguindo estes passos, o ambiente de desenvolvimento ficará configurado corretamente e a aplicação deverá rodar de forma consistente em diferentes máquinas.

Se precisar de ajuda adicional, descreva o erro encontrado e compartilhe logs do terminal para facilitar o diagnóstico.

## Desenvolvimento de Software Corporativo
arquivo: electron_transportadora

Aplicação desktop com Electron, backend em JavaScript (Node.js) e frontend com EJS. Foco em arquitetura em camadas, clareza de responsabilidades e organização de assets.

Arquitetura em poucas linhas
- Frontend (renderer):
  - Templates: EJS em renderer/views/ (páginas e partials).
  - Assets estáticos: renderer/public/css (estilos) e renderer/public/js (scripts cliente).
- Backend (dentro do Electron):
  - Rotas e controladores em routers/*.js — cada arquivo trata uma área (passageiro, veículos, rotas, relatórios, auth).
  - Inicialização: main.js e preload.js.
  - Persistência/integração: db.js.

EJS e convenções
- Views principais: paginicial.ejs, passageiro.ejs, veiculos.ejs, relatorio*.ejs.
- Partials reutilizáveis em renderer/views/partials (menu_lateral.ejs, menu_motorista.ejs, formulários).
- Prática: passar dados prontos pelo backend (res.render('view', { data })) e manter lógica mínima nas EJS.

Separação de CSS/JS
- public/css: estilos organizados por responsabilidade (layout, componentes, relatórios).
- public/js: scripts por página/componente (manipulação DOM, validações, chamadas locais).
- Recomendações rápidas: evitar estilos inline; modularizar scripts; incluir referências globais no layout base e partials só com marcação.

Rotas e organização do backend
- Cada arquivo em routers/ exporta handlers relacionados à sua entidade.
- app.js monta as rotas; controllers/ ou módulos auxiliares podem conter lógica reutilizável.
- Validar e sanitizar entrada em routers/auth.js e endpoints que recebem formulários.

## Estrutura de Dados

Implementações principais:
- Queue (TypeScript): usada para modelar filas de passageiros e veículos (FIFO) — útil para listar/percorrer itens como um "GET" e para enfileirar processos.
- HashTable (TypeScript): índice em memória para buscas rápidas na barra de pesquisa (por placa, nome etc.).

Por que foi escolhido:
- Filas garantem ordem e operations O(1) para enqueue/dequeue.
- Tabela hash permite lookup O(1) amortizado, acelerando pesquisas sem varrer listas.
- Usar essas estruturas como cache/índice junto ao banco (sincronização/invalidação).
- Implementar limites/eviction (TTL/LRU) se o volume for grande.
- Testar colisões e casos limites da hash table.
  
## Segurança & Auditoria
arquivo: scrippermissoes.sql

Projeto desktop corporativo (Electron) possui controle de passageiros, rotas, veículos e financeiro.

Perfis de acesso
- Motorista: visualização das suas viagens e dados da rota.
- Secretária: cadastrar/editar passageiros, rotas e veículos; registrar pagamentos.
- Gerente: acesso completo, incluindo gerenciamento financeiro.

Estado atual (implementação)
- Frontend: views EJS em renderer/views/ e partials (menus, formulários).
- Backend: JavaScript em routers/ (rotas por entidade) e db.js para persistência.
- Permissões: lógica atual no script scrippermissoes (ver/editar).
- Auditoria: logs existentes armazenados em MySQL, mas ainda não 100% funcional.
- CRUD: operações de cadastrar, editar e deletar para passageiros, veículos, rotas e financeiro.

Segurança e auditoria
- Autenticação: armazenar senhas com hash seguro(feito direto no mysql com sha256) e validar no backend.
- Logs confiáveis: registrar eventos de login/failed attempts e alterações financeiras; proteger logs contra alteração.
- Banco: usar usuário com privilégios mínimos para a aplicação; backups regulares.

Notas finais
- O sistema já tem a base de views e rotas; falta endurecer autenticação/autorizações e completar a auditoria em MySQL.
