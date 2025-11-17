// server/queue/passageiroHash.ts

interface Passageiro {
  idPassageiro: number;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  tipo?: string;
  cpf?: string;
  cnpj?: string;
  valor_mensal?: number;
  status?: string;
}

export class TabelaHash {
  private tabela: { [chave: string]: Passageiro[] } = {};

  private gerarChave(chave: string): string {
    return chave.toLowerCase();
  }

  // Adiciona passageiro na tabela
  adicionar(passageiro: Passageiro) {
    const keys = [this.gerarChave(passageiro.nome), this.gerarChave(passageiro.email)];
    keys.forEach(key => {
      if (!this.tabela[key]) this.tabela[key] = [];
      this.tabela[key].push(passageiro);
    });
  }

  // Busca parcial: retorna todos que contêm a substring
  buscarParcial(termo: string): Passageiro[] {
    const chave = this.gerarChave(termo);
    const resultado: Passageiro[] = [];

    for (const key in this.tabela) {
      if (key.includes(chave)) {
        this.tabela[key].forEach(p => {
          if (!resultado.includes(p)) resultado.push(p);
        });
      }
    }

    return resultado;
  }

  // Lista todos os passageiros (sem duplicados)
  listar(): Passageiro[] {
    const set = new Set<Passageiro>();
    Object.values(this.tabela).forEach(arr => arr.forEach(p => set.add(p)));
    return Array.from(set);
  }

  limpar() {
    this.tabela = {};
  }
}
