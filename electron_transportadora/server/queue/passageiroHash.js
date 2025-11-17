"use strict";
// server/queue/passageiroHash.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabelaHash = void 0;
var TabelaHash = /** @class */ (function () {
    function TabelaHash() {
        this.tabela = {};
    }
    TabelaHash.prototype.gerarChave = function (chave) {
        return chave.toLowerCase();
    };
    // Adiciona passageiro na tabela
    TabelaHash.prototype.adicionar = function (passageiro) {
        var _this = this;
        var keys = [this.gerarChave(passageiro.nome), this.gerarChave(passageiro.email)];
        keys.forEach(function (key) {
            if (!_this.tabela[key])
                _this.tabela[key] = [];
            _this.tabela[key].push(passageiro);
        });
    };
    // Busca parcial: retorna todos que contêm a substring
    TabelaHash.prototype.buscarParcial = function (termo) {
        var chave = this.gerarChave(termo);
        var resultado = [];
        for (var key in this.tabela) {
            if (key.includes(chave)) {
                this.tabela[key].forEach(function (p) {
                    if (!resultado.includes(p))
                        resultado.push(p);
                });
            }
        }
        return resultado;
    };
    // Lista todos os passageiros (sem duplicados)
    TabelaHash.prototype.listar = function () {
        var set = new Set();
        Object.values(this.tabela).forEach(function (arr) { return arr.forEach(function (p) { return set.add(p); }); });
        return Array.from(set);
    };
    TabelaHash.prototype.limpar = function () {
        this.tabela = {};
    };
    return TabelaHash;
}());
exports.TabelaHash = TabelaHash;
