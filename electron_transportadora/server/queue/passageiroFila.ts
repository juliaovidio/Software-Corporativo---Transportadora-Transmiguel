// server/queue/passageiroFila.ts
export class Fila<T> {
  private itens: T[] = [];

  // Adiciona item no final
  enqueue(item: T): void {
    this.itens.push(item);
  }

  // Remove item do início
  dequeue(): T | undefined {
    return this.itens.shift();
  }

  // Mostra todos os itens sem remover
  listar(): T[] {
    return [...this.itens];
  }

  // Verifica se está vazia
  isEmpty(): boolean {
    return this.itens.length === 0;
  }

  // Limpa a fila
  limpar(): void {
    this.itens = [];
  }
}
