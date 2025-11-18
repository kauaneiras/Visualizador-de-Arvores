import type { TreeNode, VisualizationStep } from "@/types"

type StepExtras = Partial<Pick<VisualizationStep, "arraySnapshot" | "notes" | "severity" | "ruleBroken" | "metadata">>

export type HeapType = "min" | "max"

export class Heap {
  private heap: number[] = []
  private readonly nodeMap: Map<number, string> = new Map()
  private nodeCounter = 0
  private heapType: HeapType
  private extractedElements: number[] = []

  constructor(type: HeapType = "min") {
    this.heapType = type
  }

  setHeapType(type: HeapType): void {
    this.heapType = type
    this.clear()
  }

  private generateId(): string {
    return `heap-${this.nodeCounter++}`
  }

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private getLeftChildIndex(index: number): number {
    return 2 * index + 1
  }

  private getRightChildIndex(index: number): number {
    return 2 * index + 2
  }

  private swap(i: number, j: number): void {
    ;[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
  }

  insert(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    this.heap.push(value)
    if (!this.nodeMap.has(value)) {
      this.nodeMap.set(value, this.generateId())
    }

    let currentIndex = this.heap.length - 1
    steps.push(
      this.createStep(
        "insert",
        `Inserir ${value} no final do ${this.heapType === "min" ? "Min" : "Max"} Heap`,
        this.buildTree(),
        [currentIndex],
        `${value} adicionado`,
        [],
      ),
    )

    while (currentIndex > 0) {
      const parentIndex = this.getParentIndex(currentIndex)
      const shouldSwap =
        this.heapType === "min"
          ? this.heap[currentIndex] < this.heap[parentIndex]
          : this.heap[currentIndex] > this.heap[parentIndex]

      if (shouldSwap) {
        steps.push(
          this.createStep(
            "insert",
            `${this.heap[currentIndex]} ${this.heapType === "min" ? "<" : ">"} ${this.heap[parentIndex]}, trocando`,
            this.buildTree(),
            [currentIndex, parentIndex],
            `Bubble up: trocando ${this.heap[currentIndex]} com ${this.heap[parentIndex]}`,
            [],
          ),
        )
        this.swap(currentIndex, parentIndex)
        currentIndex = parentIndex
      } else {
        break
      }
    }

    steps.push(
      this.createStep(
        "insert",
        `${value} inserido corretamente`,
        this.buildTree(),
        [],
        `Inserção completa`,
        [],
      ),
    )
    return steps
  }

  remove(): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    if (this.heap.length === 0) return steps

    const extremeValue = this.heap[0]
    this.extractedElements.push(extremeValue)
    
    steps.push(
      this.createStep(
        "remove",
        `Remover ${this.heapType === "min" ? "mínimo" : "máximo"}: ${extremeValue}`,
        this.buildTree(),
        [0],
        `Removendo raiz`,
        this.extractedElements,
      ),
    )

    this.heap[0] = this.heap[this.heap.length - 1]
    this.heap.pop()

    if (this.heap.length > 0) {
      let currentIndex = 0

      while (true) {
        let extremeIndex = currentIndex
        const leftIndex = this.getLeftChildIndex(currentIndex)
        const rightIndex = this.getRightChildIndex(currentIndex)

        if (leftIndex < this.heap.length) {
          const shouldUpdate =
            this.heapType === "min"
              ? this.heap[leftIndex] < this.heap[extremeIndex]
              : this.heap[leftIndex] > this.heap[extremeIndex]
          if (shouldUpdate) {
            extremeIndex = leftIndex
          }
        }

        if (rightIndex < this.heap.length) {
          const shouldUpdate =
            this.heapType === "min"
              ? this.heap[rightIndex] < this.heap[extremeIndex]
              : this.heap[rightIndex] > this.heap[extremeIndex]
          if (shouldUpdate) {
            extremeIndex = rightIndex
          }
        }

        if (extremeIndex !== currentIndex) {
          steps.push(
            this.createStep(
              "remove",
              `Trocando ${this.heap[currentIndex]} com ${this.heap[extremeIndex]}`,
              this.buildTree(),
              [currentIndex, extremeIndex],
              `Bubble down`,
              this.extractedElements,
            ),
          )
          this.swap(currentIndex, extremeIndex)
          currentIndex = extremeIndex
        } else {
          break
        }
      }
    }

    steps.push(
      this.createStep(
        "remove",
        `${extremeValue} removido`,
        this.buildTree(),
        [],
        `Remoção completa`,
        this.extractedElements,
      ),
    )
    return steps
  }

  sort(): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    if (this.heap.length === 0) return steps

    steps.push(
      this.createStep(
        "sort",
        `Iniciando Heap Sort (${this.heapType === "min" ? "Min" : "Max"})`,
        this.buildTree(),
        [],
        `Processo de ordenação começando`,
        [],
      ),
    )

    const heapCopy = [...this.heap]
    const sorted: number[] = []

    while (heapCopy.length > 0) {
      const extremeIndex = 0
      steps.push(
        this.createStep(
          "sort",
          `Extrair ${this.heapType === "min" ? "mínimo" : "máximo"}: ${heapCopy[extremeIndex]}`,
          this.buildHeapFromArray(heapCopy),
          [extremeIndex],
          `O elemento ${this.heapType === "min" ? "mínimo" : "máximo"} ${heapCopy[extremeIndex]} é adicionado ao resultado`,
          sorted,
        ),
      )

      sorted.push(heapCopy[0])
      heapCopy[0] = heapCopy[heapCopy.length - 1]
      heapCopy.pop()

      if (heapCopy.length > 0) {
        let currentIndex = 0
        while (true) {
          let extremeIndex = currentIndex
          const leftIndex = 2 * currentIndex + 1
          const rightIndex = 2 * currentIndex + 2

          if (leftIndex < heapCopy.length) {
            const shouldUpdate =
              this.heapType === "min"
                ? heapCopy[leftIndex] < heapCopy[extremeIndex]
                : heapCopy[leftIndex] > heapCopy[extremeIndex]
            if (shouldUpdate) {
              extremeIndex = leftIndex
            }
          }

          if (rightIndex < heapCopy.length) {
            const shouldUpdate =
              this.heapType === "min"
                ? heapCopy[rightIndex] < heapCopy[extremeIndex]
                : heapCopy[rightIndex] > heapCopy[extremeIndex]
            if (shouldUpdate) {
              extremeIndex = rightIndex
            }
          }

          if (extremeIndex !== currentIndex) {
            steps.push(
              this.createStep(
                "sort",
                `Reordenar heap: trocar ${heapCopy[currentIndex]} e ${heapCopy[extremeIndex]}`,
                this.buildHeapFromArray(heapCopy),
                [currentIndex, extremeIndex],
                `Bubble down para manter propriedade de ${this.heapType === "min" ? "Min" : "Max"} Heap`,
                sorted,
              ),
            )
            ;[heapCopy[currentIndex], heapCopy[extremeIndex]] = [heapCopy[extremeIndex], heapCopy[currentIndex]]
            currentIndex = extremeIndex
          } else {
            break
          }
        }
      }
    }

    steps.push(
      this.createStep(
        "sort",
        `Ordenação completa: [${sorted.join(", ")}]`,
        null,
        [],
        `Heap Sort finalizado com sucesso`,
        sorted,
      ),
    )
    return steps
  }

  search(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []
    const visitedIndices: number[] = []
    const complexityLabel = "O(n) (busca linear no array do heap)"
    let iteration = 0
    
    // Se heap vazia
    if (this.heap.length === 0) {
      steps.push(
        this.createStep(
          "search",
          `Heap vazia`,
          null,
          [],
          `Impossível buscar em heap vazia`,
          [],
          {
            severity: "warning",
            notes: ["Estrutura vazia", "Complexidade teórica: O(n)"],
            metadata: { target: value, iteration: 0, visitedCount: 0, complexity: complexityLabel },
          },
        ),
      )
      return steps
    }

    // Busca linear na heap com passos
    let found = -1

    for (let i = 0; i < this.heap.length; i++) {
      iteration += 1
      visitedIndices.push(i)
      steps.push(
        this.createStep(
          "search",
          `Iteração ${iteration}: visitando índice ${i} (valor ${this.heap[i]})`,
          this.buildTree(),
          [...visitedIndices],
          `Iteração ${iteration} — Procurando ${value}. Valores visitados: ${this.heap
            .slice(0, i + 1)
            .join(" → ")}`,
          [],
          {
            notes: [
              `Iteração ${iteration}`,
              `Comparando ${value} com ${this.heap[i]}`,
              `Complexidade em execução: ${complexityLabel}`,
            ],
            metadata: {
              target: value,
              iteration,
              visitedCount: visitedIndices.length,
              currentIndex: i,
              complexity: complexityLabel,
              pathSequence: this.heap.slice(0, i + 1),
            },
          },
        ),
      )

      if (this.heap[i] === value) {
        found = i
        steps.push(
          this.createStep(
            "search",
            `Encontrado! ${value} no índice ${found}`,
            this.buildTree(),
            [...visitedIndices],
            `Elemento ${value} encontrado em ${iteration} iteração(ões). Visitados: ${this.heap
              .slice(0, i + 1)
              .join(" → ")}`,
            [],
            {
              notes: ["Busca concluída", `Total de iterações: ${iteration}`],
              metadata: {
                target: value,
                foundIndex: found,
                iteration,
                totalIterations: iteration,
                visitedCount: visitedIndices.length,
                complexity: complexityLabel,
                pathSequence: this.heap.slice(0, i + 1),
              },
            },
          ),
        )
        return steps
      }
    }

    // Se não encontrou
    steps.push(
      this.createStep(
        "search",
        `${value} não encontrado`,
        this.buildTree(),
        [...visitedIndices],
        `Elemento ${value} não existe no heap após ${iteration} iteração(ões). Visitados: ${this.heap.join(" → ")}`,
        [],
        {
          severity: "warning",
          notes: [
            `Total de iterações: ${iteration}`,
            `Complexidade observada: ${complexityLabel}`,
          ],
          metadata: {
            target: value,
            found: false,
            totalIterations: iteration,
            visitedCount: visitedIndices.length,
            complexity: complexityLabel,
            pathSequence: [...this.heap],
          },
        },
      ),
    )
    
    return steps
  }

  traverse(type: string = "inorder"): { steps: VisualizationStep[]; order: number[] } {
    const steps: VisualizationStep[] = []
    const order: number[] = []

    const levelorder = () => {
      const queue: (TreeNode | null)[] = []
      if (this.heap.length > 0) {
        queue.push(this.buildTree())
      }

      while (queue.length > 0) {
        const node = queue.shift()
        if (node) {
          order.push(node.value)
          steps.push(
            this.createStep(
              "traverse",
              `Visitando ${node.value}`,
              this.buildTree(),
              [],
              `Percurso por nível: ${node.value}. Ordem: ${order.join(", ")}`,
              [],
            ),
          )
          if (node.left) queue.push(node.left)
          if (node.right) queue.push(node.right)
        }
      }
    }

    levelorder()
    return { steps, order }
  }

  private buildHeapFromArray(heapArray: number[]): TreeNode | null {
    if (heapArray.length === 0) return null

    const nodes: Map<number, TreeNode> = new Map()

    for (let i = 0; i < heapArray.length; i++) {
      nodes.set(i, {
        id: `heap-sort-${i}`,
        value: heapArray[i],
      })
    }

    for (let i = 0; i < heapArray.length; i++) {
      const node = nodes.get(i)!
      const leftIndex = 2 * i + 1
      const rightIndex = 2 * i + 2

      if (leftIndex < heapArray.length) {
        node.left = nodes.get(leftIndex)
      }
      if (rightIndex < heapArray.length) {
        node.right = nodes.get(rightIndex)
      }
    }

    return nodes.get(0) || null
  }

  private buildTree(): TreeNode | null {
    if (this.heap.length === 0) return null

    const nodes: Map<number, TreeNode> = new Map()

    for (let i = 0; i < this.heap.length; i++) {
      nodes.set(i, {
        id: this.nodeMap.get(this.heap[i]) || `heap-${i}`,
        value: this.heap[i],
      })
    }

    for (let i = 0; i < this.heap.length; i++) {
      const node = nodes.get(i)!
      const leftIndex = this.getLeftChildIndex(i)
      const rightIndex = this.getRightChildIndex(i)

      if (leftIndex < this.heap.length) {
        node.left = nodes.get(leftIndex)
      }
      if (rightIndex < this.heap.length) {
        node.right = nodes.get(rightIndex)
      }
    }

    return nodes.get(0) || null
  }

  private createStep(
    type: "insert" | "remove" | "sort" | "search" | "traverse",
    description: string,
    tree: TreeNode | null,
    highlighted: number[],
    explanation: string,
    sortedElements: number[],
    extras: StepExtras = {},
  ): VisualizationStep {
    const defaultNotes = extras.notes ?? [description, explanation]
    const defaultMetadata = extras.metadata ?? {}

    return {
      id: `step-${Date.now()}-${Math.random()}`,
      type,
      description,
      tree,
      highlightedNodes: highlighted.map((i) => this.nodeMap.get(this.heap[i]) || `heap-${i}`),
      highlightedEdges: [],
      explanation,
      timestamp: Date.now(),
      sortedElements,
      notes: defaultNotes,
      metadata: defaultMetadata,
      ...extras,
    }
  }

  clear(): void {
    this.heap = []
    this.nodeMap.clear()
    this.nodeCounter = 0
    this.extractedElements = []
  }
}

export class MinHeap extends Heap {
  constructor() {
    super("min")
  }
}
