"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fila = void 0;
// server/queue/veiculoFila.ts
var Fila = /** @class */ (function () {
    function Fila() {
        this.itens = [];
    }
    Fila.prototype.enqueue = function (item) {
        this.itens.push(item);
    };
    Fila.prototype.dequeue = function () {
        return this.itens.shift();
    };
    Fila.prototype.listar = function () {
        return __spreadArray([], this.itens, true);
    };
    Fila.prototype.isEmpty = function () {
        return this.itens.length === 0;
    };
    Fila.prototype.limpar = function () {
        this.itens = [];
    };
    return Fila;
}());
exports.Fila = Fila;
