// server/queue/veiculoFila.ts
export class Fila<T> {
  private itens: T[] = [];

  enqueue(item: T): void {
    this.itens.push(item);
  }

  dequeue(): T | undefined {
    return this.itens.shift();
  }

  listar(): T[] {
    return [...this.itens];
  }

  isEmpty(): boolean {
    return this.itens.length === 0;
  }

  limpar(): void {
    this.itens = [];
  }
}
