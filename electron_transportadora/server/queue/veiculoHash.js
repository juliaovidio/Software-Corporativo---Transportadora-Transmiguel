"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabelaHash = void 0;
var TabelaHash = /** @class */ (function () {
    function TabelaHash() {
        this.tabela = {};
    }
    TabelaHash.prototype.gerarChave = function (chave) {
        return chave.toLowerCase();
    };
    TabelaHash.prototype.adicionar = function (veiculo) {
        var _this = this;
        var keys = [
            this.gerarChave(veiculo.placa),
            this.gerarChave(veiculo.modelo),
            this.gerarChave(String(veiculo.capacidade))
        ];
        keys.forEach(function (key) {
            if (!_this.tabela[key])
                _this.tabela[key] = [];
            _this.tabela[key].push(veiculo);
        });
    };
    // Busca parcial: qualquer campo que contenha a substring
    TabelaHash.prototype.buscarParcial = function (termo) {
        var chave = this.gerarChave(termo);
        var resultado = [];
        for (var key in this.tabela) {
            if (key.includes(chave)) {
                this.tabela[key].forEach(function (v) {
                    if (!resultado.includes(v))
                        resultado.push(v);
                });
            }
        }
        return resultado;
    };
    TabelaHash.prototype.listar = function () {
        var set = new Set();
        Object.values(this.tabela).forEach(function (arr) { return arr.forEach(function (v) { return set.add(v); }); });
        return Array.from(set);
    };
    TabelaHash.prototype.limpar = function () {
        this.tabela = {};
    };
    return TabelaHash;
}());
exports.TabelaHash = TabelaHash;
