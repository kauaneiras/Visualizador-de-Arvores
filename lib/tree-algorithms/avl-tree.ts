import type { TreeNode, VisualizationStep } from "@/types"

type StepExtras = Partial<
  Pick<VisualizationStep, "arraySnapshot" | "notes" | "severity" | "ruleBroken" | "metadata" | "sortedElements">
>

/**
 * AVL Tree - Árvore Binária de Busca auto-balanceada
 * Mantém fator de balanceamento entre -1 e 1 através de rotações
 */
export class AVLTree {
  root: TreeNode | null = null
  private nodeCounter = 0

  private generateId(): string {
    return `avl-${this.nodeCounter++}`
  }

  private getHeight(node: TreeNode | null | undefined): number {
    if (!node) return -1
    if (node.height === undefined) {
      node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1
    }
    return node.height
  }

  private getBalanceFactor(node: TreeNode | null | undefined): number {
    if (!node) return 0
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  private updateHeight(node: TreeNode): void {
    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1
    node.balanceFactor = this.getBalanceFactor(node)
  }

  /**
   * Rotação à direita com captura de passo
   * Caso: Filho esquerdo desbalanceado para esquerda
   */
  private rotateRight(node: TreeNode, steps: VisualizationStep[]): TreeNode {
    const left = node.left!
    node.left = left.right
    if (left.right) {
      left.right.parent = node
    }
    left.parent = node.parent
    left.right = node
    node.parent = left

    this.updateHeight(node)
    this.updateHeight(left)

    steps.push(
      this.createStep(
        "insert",
        `Rotação à direita: ${left.value} sobe`,
        this.root,
        [left.id, node.id],
        [],
        `Nó ${left.value} rotacionado acima de ${node.value}`,
        {
          metadata: { rotation: "right", pivot: node.value, promoted: left.value },
          notes: ["Filho esquerdo assume o lugar do pai", "Reequilibramos o caminho esquerdo"],
        },
      ),
    )

    return left
  }

  /**
   * Rotação à esquerda com captura de passo
   * Caso: Filho direito desbalanceado para direita
   */
  private rotateLeft(node: TreeNode, steps: VisualizationStep[]): TreeNode {
    const right = node.right!
    node.right = right.left
    if (right.left) {
      right.left.parent = node
    }
    right.parent = node.parent
    right.left = node
    node.parent = right

    this.updateHeight(node)
    this.updateHeight(right)

    steps.push(
      this.createStep(
        "insert",
        `Rotação à esquerda: ${right.value} sobe`,
        this.root,
        [right.id, node.id],
        [],
        `Nó ${right.value} rotacionado acima de ${node.value}`,
        {
          metadata: { rotation: "left", pivot: node.value, promoted: right.value },
          notes: ["Filho direito assume o lugar do pai", "Reequilibramos o caminho direito"],
        },
      ),
    )

    return right
  }

  insert(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []
  let insertedNode: TreeNode | null = null
  let insertedNodeId: string | null = null

    const insertHelper = (node: TreeNode | null, val: number): TreeNode => {
      // Caso base: inserir novo nó
      if (!node) {
        insertedNode = {
          id: this.generateId(),
          value: val,
          height: 0,
          balanceFactor: 0,
        }
        insertedNodeId = insertedNode.id
        steps.push(this.createStep("insert", `Inserir ${val}`, this.root, [insertedNode.id], [], `Nó ${val} criado`))
        return insertedNode
      }

      // Inserir recursivamente
      if (val < node.value) {
        node.left = insertHelper(node.left ?? null, val)
        if (node.left) {
          node.left.parent = node
        }
      } else if (val > node.value) {
        node.right = insertHelper(node.right ?? null, val)
        if (node.right) {
          node.right.parent = node
        }
      } else {
        steps.push(this.createStep("insert", `Valor ${val} já existe`, this.root, [], [], `Valor duplicado ignorado`))
        return node
      }

      // Atualizar altura e fator de balanceamento
      this.updateHeight(node)
      const balance = node.balanceFactor!

      steps.push(
        this.createStep(
          "insert",
          `Verificar balanceamento de ${node.value}: fator = ${balance}`,
          this.root,
          [node.id],
          [],
          `Fator de balanceamento: ${balance}`,
        ),
      )

      // Caso: Left-Left
      const leftChild = node.left
      const rightChild = node.right

      if (balance > 1 && leftChild && val < leftChild.value) {
        steps.push(
          this.createStep(
            "insert",
            `Desequilíbrio Left-Left detectado em ${node.value}`,
            this.root,
            [node.id, leftChild.id],
            [],
            `Necessária rotação à direita`,
          ),
        )
        return this.rotateRight(node, steps)
      }

      // Caso: Right-Right
      if (balance < -1 && rightChild && val > rightChild.value) {
        steps.push(
          this.createStep(
            "insert",
            `Desequilíbrio Right-Right detectado em ${node.value}`,
            this.root,
            [node.id, rightChild.id],
            [],
            `Necessária rotação à esquerda`,
          ),
        )
        return this.rotateLeft(node, steps)
      }

      // Caso: Left-Right
      if (balance > 1 && leftChild && val > leftChild.value) {
        steps.push(
          this.createStep(
            "insert",
            `Desequilíbrio Left-Right detectado em ${node.value}`,
            this.root,
            [node.id, leftChild.id],
            [],
            `Necessárias rotações duplas`,
          ),
        )
        node.left = this.rotateLeft(leftChild, steps)
        return this.rotateRight(node, steps)
      }

      // Caso: Right-Left
      if (balance < -1 && rightChild && val < rightChild.value) {
        steps.push(
          this.createStep(
            "insert",
            `Desequilíbrio Right-Left detectado em ${node.value}`,
            this.root,
            [node.id, rightChild.id],
            [],
            `Necessárias rotações duplas`,
          ),
        )
        node.right = this.rotateRight(rightChild, steps)
        return this.rotateLeft(node, steps)
      }

      return node
    }

    this.root = insertHelper(this.root, value)
    const highlightNodes: string[] = insertedNodeId ? [insertedNodeId] : []
    steps.push(
      this.createStep(
        "insert",
        `${value} inserido com sucesso`,
        this.root,
        highlightNodes,
        [],
        `Inserção completa`,
      ),
    )
    return steps
  }

  remove(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    const removeHelper = (node: TreeNode | null, val: number): TreeNode | null => {
      if (!node) {
        steps.push(this.createStep("remove", `Valor ${val} não encontrado`, this.root, [], [], `Nó não existe`))
        return null
      }

      if (val < node.value) {
        node.left = removeHelper(node.left ?? null, val) ?? undefined
        if (node.left) node.left.parent = node
      } else if (val > node.value) {
        node.right = removeHelper(node.right ?? null, val) ?? undefined
        if (node.right) node.right.parent = node
      } else {
        steps.push(this.createStep("remove", `Encontrado nó ${val}`, this.root, [node.id], [], `Removendo ${val}`))

        // Nó folha
        if (!node.left && !node.right) {
          steps.push(
            this.createStep("remove", `${val} é folha, removendo`, this.root, [node.id], [], `Nó folha removido`),
          )
          return null
        }

        // Um filho
        if (!node.left) {
          const rightChild = node.right
          steps.push(
            this.createStep(
              "remove",
              `${val} tem apenas filho direito`,
              this.root,
              [node.id, rightChild?.id ?? node.id],
              [],
              `Substituindo por filho direito`,
            ),
          )
          return node.right ?? null
        }
        if (!node.right) {
          const leftChild = node.left
          steps.push(
            this.createStep(
              "remove",
              `${val} tem apenas filho esquerdo`,
              this.root,
              [node.id, leftChild?.id ?? node.id],
              [],
              `Substituindo por filho esquerdo`,
            ),
          )
          return node.left ?? null
        }

        // Dois filhos - inorder successor
        let successor = node.right
        while (successor.left) {
          successor = successor.left
        }
        steps.push(
          this.createStep(
            "remove",
            `Sucessor inorder: ${successor.value}`,
            this.root,
            [node.id, successor.id],
            [],
            `Encontrado sucessor`,
          ),
        )

        node.value = successor.value
  node.right = removeHelper(node.right ?? null, successor.value) ?? undefined
        if (node.right) node.right.parent = node
      }

      if (!node) return null

      this.updateHeight(node)
      const balance = node.balanceFactor!

      steps.push(
        this.createStep(
          "remove",
          `Verificar balanceamento de ${node.value}`,
          this.root,
          [node.id],
          [],
          `Fator de balanceamento: ${balance}`,
        ),
      )

      // Rebalancear como no insert
      if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
        return this.rotateRight(node, steps)
      }

      if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left!, steps)
        return this.rotateRight(node, steps)
      }

      if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
        return this.rotateLeft(node, steps)
      }

      if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right!, steps)
        return this.rotateLeft(node, steps)
      }

      return node
    }

    this.root = removeHelper(this.root, value)
    steps.push(this.createStep("remove", `Remoção de ${value} completa`, this.root, [], [], `Árvore rebalanceada`))
    return steps
  }

  search(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []
    let current = this.root
    const pathSequence: number[] = []
    const pathNodes: TreeNode[] = []
    const complexityLabel = "O(log n) garantido"
    let iteration = 0

    while (current) {
      iteration += 1
      pathSequence.push(current.value)
      pathNodes.push(current)
      const highlightedPath = pathNodes.map((node) => node.id)
      let directionNote: string
      if (value < current.value) {
        directionNote = "Valor menor → seguir à esquerda"
      } else if (value > current.value) {
        directionNote = "Valor maior → seguir à direita"
      } else {
        directionNote = "Valores iguais"
      }

      steps.push(
        this.createStep(
          "search",
          `Iteração ${iteration}: visitando ${current.value}, fator: ${current.balanceFactor}`,
          this.root,
          highlightedPath,
          [],
          `Iteração ${iteration} — Procurando ${value}. Caminho: ${pathSequence.join(" → ")}`,
          {
            notes: [
              `Iteração ${iteration}`,
              `Comparando ${value} com ${current.value}`,
              directionNote,
              `Complexidade esperada: ${complexityLabel}`,
            ],
            metadata: {
              target: value,
              pathSequence: [...pathSequence],
              balanceFactor: current.balanceFactor,
              iteration,
              visitedCount: pathSequence.length,
              complexity: complexityLabel,
            },
          },
        ),
      )

      if (current.value === value) {
        steps.push(
          this.createStep(
            "search",
            `Encontrado! ${value}`,
            this.root,
            highlightedPath,
            [],
            `Valor encontrado em ${iteration} iteração(ões)! Caminho: ${pathSequence.join(" → ")}`,
            {
              notes: ["Atual valor coincide com o procurado", "Busca finalizada"],
              metadata: {
                target: value,
                pathSequence: [...pathSequence],
                found: true,
                iteration,
                totalIterations: iteration,
                visitedCount: pathSequence.length,
                complexity: complexityLabel,
              },
            },
          ),
        )
        return steps
      }

      if (value < current.value) {
        current = current.left ?? null
      } else {
        current = current.right ?? null
      }
    }

    const highlightedPath = pathNodes.map((node) => node.id)
    steps.push(
      this.createStep(
        "search",
        `${value} não encontrado`,
        this.root,
        highlightedPath,
        [],
        `Procura sem sucesso após ${pathSequence.length} iteração(ões). Caminho: ${pathSequence.join(" → ")}`,
        {
          severity: "warning",
          notes: [
            `Total de iterações: ${pathSequence.length}`,
            "Chegamos a uma folha ou ramo vazio",
            `Caminho percorrido: ${pathSequence.join(" → ") || "—"}`,
          ],
          metadata: {
            target: value,
            pathSequence: [...pathSequence],
            found: false,
            totalIterations: pathSequence.length,
            visitedCount: pathSequence.length,
            complexity: complexityLabel,
          },
        },
      ),
    )
    return steps
  }

  traverse(type: string = "inorder"): { steps: VisualizationStep[]; order: number[] } {
    const steps: VisualizationStep[] = []
    const order: number[] = []

    const inorder = (node: TreeNode | null) => {
      if (!node) return
  inorder(node.left ?? null)
      order.push(node.value)
      steps.push(
        this.createStep(
          "traverse",
          `Visitando ${node.value}, fator: ${node.balanceFactor}`,
          this.root,
          [node.id],
          [],
          `Percurso inorder: ${node.value}. Ordem: ${order.join(", ")}`,
        ),
      )
  inorder(node.right ?? null)
    }

    inorder(this.root)
    return { steps, order }
  }

  private createStep(
    type: "insert" | "remove" | "search" | "traverse",
    description: string,
    tree: TreeNode | null,
    highlighted: string[],
    edges: string[],
    explanation: string,
    extras: StepExtras = {},
  ): VisualizationStep {
    const defaultNotes = extras.notes ?? [description, explanation]
    const defaultMetadata = extras.metadata ?? {}

    return {
      id: `step-${Date.now()}-${Math.random()}`,
      type,
      description,
      tree: tree ? this.cloneTree(tree) : null,
      highlightedNodes: highlighted,
      highlightedEdges: edges,
      explanation,
      timestamp: Date.now(),
      notes: defaultNotes,
      metadata: defaultMetadata,
      ...extras,
    }
  }

  private cloneTree(node: TreeNode): TreeNode {
    return {
      ...node,
      left: node.left ? this.cloneTree(node.left) : undefined,
      right: node.right ? this.cloneTree(node.right) : undefined,
    }
  }

  clear(): void {
    this.root = null
    this.nodeCounter = 0
  }
}
