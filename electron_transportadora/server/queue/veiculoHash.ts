// server/queue/veiculoHash.ts
interface Veiculo {
  id: number;
  modelo: string;
  ano: number;
  placa: string;
  capacidade: number;
  revisao_km?: number;
  status?: string;
}

export class TabelaHash {
  private tabela: { [chave: string]: Veiculo[] } = {};

  private gerarChave(chave: string): string {
    return chave.toLowerCase();
  }

  adicionar(veiculo: Veiculo) {
    const keys = [
      this.gerarChave(veiculo.placa),
      this.gerarChave(veiculo.modelo),
      this.gerarChave(String(veiculo.capacidade))
    ];

    keys.forEach(key => {
      if (!this.tabela[key]) this.tabela[key] = [];
      this.tabela[key].push(veiculo);
    });
  }

  // Busca parcial: qualquer campo que contenha a substring
  buscarParcial(termo: string): Veiculo[] {
    const chave = this.gerarChave(termo);
    const resultado: Veiculo[] = [];

    for (const key in this.tabela) {
      if (key.includes(chave)) {
        this.tabela[key].forEach(v => {
          if (!resultado.includes(v)) resultado.push(v);
        });
      }
    }

    return resultado;
  }

  listar(): Veiculo[] {
    const set = new Set<Veiculo>();
    Object.values(this.tabela).forEach(arr => arr.forEach(v => set.add(v)));
    return Array.from(set);
  }

  limpar() {
    this.tabela = {};
  }
}
