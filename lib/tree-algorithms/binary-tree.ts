import type { TreeNode, VisualizationStep, TraversalStep, TraversalType } from "@/types"

type StepExtras = Partial<
  Pick<VisualizationStep, "arraySnapshot" | "notes" | "severity" | "ruleBroken" | "metadata" | "sortedElements">
>

export class BinaryTree {
  root: TreeNode | null = null
  private nodeCounter = 0

  private generateId(): string {
    return `node-${this.nodeCounter++}`
  }

  insert(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    if (this.root === null) {
      this.root = {
        id: this.generateId(),
        value,
        x: 0,
        y: 0,
      }
      steps.push(
        this.createStep(
          "insert",
          `Inserir ${value} como raiz`,
          this.root,
          [this.root.id],
          [],
          `Nó ${value} inserido como raiz`,
          {
            notes: ["Árvore estava vazia", "O primeiro valor sempre se torna a raiz"],
            metadata: { insertedValue: value, becameRoot: true },
          },
        ),
      )
      return steps
    }

  let current = this.root

    while (current) {
      if (value < current.value) {
        if (!current.left) {
          const newNode: TreeNode = {
            id: this.generateId(),
            value,
            parent: current,
          }
          current.left = newNode
          steps.push(
            this.createStep(
              "insert",
              `Inserir ${value} à esquerda de ${current.value}`,
              this.root,
              [newNode.id],
              [],
              `Nó ${value} inserido à esquerda`,
              {
                notes: [
                  `Comparando ${value} com ${current.value}`,
                  "Como é menor, posicionamos o novo nó na subárvore esquerda",
                ],
                metadata: {
                  insertedValue: value,
                  parentValue: current.value,
                  direction: "left",
                },
              },
            ),
          )
          break
        }
        current = current.left || null
      } else {
        if (!current.right) {
          const newNode: TreeNode = {
            id: this.generateId(),
            value,
            parent: current,
          }
          current.right = newNode
          steps.push(
            this.createStep(
              "insert",
              `Inserir ${value} à direita de ${current.value}`,
              this.root,
              [newNode.id],
              [],
              `Nó ${value} inserido à direita`,
              {
                notes: [
                  `Comparando ${value} com ${current.value}`,
                  "Como é maior ou igual, posicionamos na subárvore direita",
                ],
                metadata: {
                  insertedValue: value,
                  parentValue: current.value,
                  direction: "right",
                },
              },
            ),
          )
          break
        }
        current = current.right || null
      }
    }

    return steps
  }

  remove(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    const findNode = (node: TreeNode | null): TreeNode | null => {
      if (!node) return null
      if (value === node.value) return node
      if (value < node.value) return findNode(node.left ?? null)
      return findNode(node.right ?? null)
    }

    const nodeToRemove = findNode(this.root)
    if (!nodeToRemove) {
      steps.push(
        this.createStep(
          "remove",
          `Valor ${value} não encontrado`,
          this.root,
          [],
          [],
          `Valor não existe na árvore`,
          {
            severity: "warning",
            notes: ["Percorremos a árvore sem localizar o valor", `Valor buscado: ${value}`],
            metadata: { attemptedValue: value },
          },
        ),
      )
      return steps
    }

    steps.push(
      this.createStep(
        "remove",
        `Encontrado nó com valor ${value}`,
        this.root,
        [nodeToRemove.id],
        [],
        `Removendo nó ${value}`,
        {
          notes: ["Encontramos o nó alvo", "Identificar caso específico para a remoção"],
          metadata: { nodeId: nodeToRemove.id, value },
        },
      ),
    )

    // Se é folha
    if (!nodeToRemove.left && !nodeToRemove.right) {
      if (nodeToRemove.parent) {
        if (nodeToRemove.parent.left?.id === nodeToRemove.id) {
          nodeToRemove.parent.left = undefined
        } else {
          nodeToRemove.parent.right = undefined
        }
      } else {
        this.root = null
      }
      steps.push(
        this.createStep(
          "remove",
          `Nó ${value} removido (era folha)`,
          this.root,
          [],
          [],
          `Nó folha removido`,
          {
            notes: ["Folhas podem ser removidas sem reequilibrar a árvore"],
            metadata: { case: "leaf", removedValue: value },
          },
        ),
      )
      return steps
    }

    // Se tem apenas um filho
    if (!nodeToRemove.left || !nodeToRemove.right) {
      const child = nodeToRemove.left || nodeToRemove.right
      if (child) {
        child.parent = nodeToRemove.parent
      }
      if (nodeToRemove.parent) {
        if (nodeToRemove.parent.left?.id === nodeToRemove.id) {
          nodeToRemove.parent.left = child
        } else {
          nodeToRemove.parent.right = child
        }
      } else {
        this.root = child || null
      }
      steps.push(
        this.createStep(
          "remove",
          `Nó ${value} removido (um filho)`,
          this.root,
          [],
          [],
          `Nó com um filho removido`,
          {
            notes: ["Promovemos o único filho para manter a propriedade BST"],
            metadata: { case: "single-child", removedValue: value, promotedChild: child?.value },
          },
        ),
      )
      return steps
    }

    // Se tem dois filhos - inorder successor
    let successor = nodeToRemove.right
    while (successor?.left) {
      successor = successor.left
    }

    if (successor) {
      const successorValue = successor.value
      steps.push(
        this.createStep(
          "remove",
          `Sucessor inorder encontrado: ${successorValue}`,
          this.root,
          [successor.id],
          [],
          `Procurando sucessor inorder`,
          {
            notes: ["Quando há dois filhos copiamos o menor valor da subárvore direita"],
            metadata: { case: "two-children", successor: successorValue, replacedValue: nodeToRemove.value },
          },
        ),
      )

      nodeToRemove.value = successor.value
      steps.push(
        this.createStep(
          "remove",
          `Substituindo valor por ${successorValue}`,
          this.root,
          [nodeToRemove.id],
          [],
          `Copiamos o valor do sucessor para o nó alvo antes de removê-lo`,
          {
            notes: ["Mantemos a estrutura copiando apenas o valor", "Próximo passo é remover o sucessor duplicado"],
            metadata: { case: "two-children", replacementValue: successorValue },
          },
        ),
      )
      const removeSteps = this.removeNode(successor)
      steps.push(...removeSteps)
    }

    return steps
  }

  private removeNode(node: TreeNode): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    if (!node.left && !node.right) {
      if (node.parent) {
        if (node.parent.left?.id === node.id) {
          node.parent.left = undefined
        } else {
          node.parent.right = undefined
        }
      }
      steps.push(
        this.createStep(
          "remove",
          `Removendo nó auxiliar ${node.value} (folha)`,
          this.root,
          [node.id],
          [],
          `Sucessor não possui filhos, basta removê-lo`,
          {
            metadata: { case: "successor-leaf", removedValue: node.value },
            notes: ["Este nó era o sucessor inorder", "Como é folha, basta desconectá-lo"],
          },
        ),
      )
      return steps
    }

    if (!node.left || !node.right) {
      const child = node.left || node.right
      if (child) {
        child.parent = node.parent
      }
      if (node.parent) {
        if (node.parent.left?.id === node.id) {
          node.parent.left = child
        } else {
          node.parent.right = child
        }
      }
      steps.push(
        this.createStep(
          "remove",
          `Removendo nó auxiliar ${node.value} (um filho)`,
          this.root,
          [node.id],
          [],
          `Promovemos o único filho do sucessor para ocupar o lugar dele`,
          {
            metadata: { case: "successor-single-child", removedValue: node.value, promotedChild: child?.value },
            notes: ["Sucessor tinha apenas um filho", "Após promover o filho, removemos o sucessor"],
          },
        ),
      )
      return steps
    }

    return steps
  }

  search(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []
    let current = this.root
    const pathSequence: number[] = []
    const pathNodes: TreeNode[] = []
    const complexityLabel = "O(h) | Médio: O(log n) · Pior: O(n)"
    let iteration = 0

    while (current) {
      iteration += 1
      pathSequence.push(current.value)
      pathNodes.push(current)
      const highlightedPath = pathNodes.map((node) => node.id)
      let comparisonDirection: "left" | "right" | "equal"
      if (value < current.value) {
        comparisonDirection = "left"
      } else if (value > current.value) {
        comparisonDirection = "right"
      } else {
        comparisonDirection = "equal"
      }

      let comparisonNote: string
      if (comparisonDirection === "left") {
        comparisonNote = "Valor alvo é menor: ir para a esquerda"
      } else if (comparisonDirection === "right") {
        comparisonNote = "Valor alvo é maior: ir para a direita"
      } else {
        comparisonNote = "Valores são iguais"
      }
      steps.push(
        this.createStep(
          "search",
          `Iteração ${iteration}: visitando ${current.value}`,
          this.root,
          highlightedPath,
          [],
          `Iteração ${iteration} — Procurando ${value}. Caminho: ${pathSequence.join(" → ")}`,
          {
            notes: [
              `Iteração ${iteration}`,
              `Comparando ${value} com ${current.value}`,
              comparisonNote,
              `Complexidade esperada: ${complexityLabel}`,
            ],
            metadata: {
              target: value,
              pathSequence: [...pathSequence],
              comparisonResult: comparisonDirection === "equal" ? "match" : comparisonDirection,
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
            `Valor ${value} encontrado em ${iteration} iteração(ões)! Caminho: ${pathSequence.join(" → ")}`,
            {
              notes: ["Comparamos e obtivemos igualdade", "Busca concluída"],
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
        `Valor ${value} não encontrado`,
        this.root,
        highlightedPath,
        [],
        `Procura sem sucesso após ${pathSequence.length} iteração(ões). Caminho percorrido: ${pathSequence.join(" → ")}`,
        {
          severity: "warning",
          notes: [
            `Total de iterações: ${pathSequence.length}`,
            "Chegamos a um ramo vazio",
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

  traverse(type: "inorder" | "preorder" | "postorder" | "levelorder" = "inorder"): { steps: VisualizationStep[]; order: number[] } {
    const steps: VisualizationStep[] = []
    const order: number[] = []

    const inorder = (node: TreeNode | null) => {
      if (!node) return
  inorder(node.left ?? null)
      order.push(node.value)
      steps.push(
        this.createStep(
          "traverse",
          `Visitando ${node.value}`,
          this.root,
          [node.id],
          [],
          `Percurso inorder: visitando ${node.value}. Ordem: ${order.join(", ")}`,
          {
            metadata: { traversalType: "inorder", orderSnapshot: [...order], current: node.value },
            notes: ["Visita nó após percorrer subárvore esquerda"],
          },
        ),
      )
  inorder(node.right ?? null)
    }

    const preorder = (node: TreeNode | null) => {
      if (!node) return
      order.push(node.value)
      steps.push(
        this.createStep(
          "traverse",
          `Visitando ${node.value}`,
          this.root,
          [node.id],
          [],
          `Percurso preorder: visitando ${node.value}. Ordem: ${order.join(", ")}`,
          {
            metadata: { traversalType: "preorder", orderSnapshot: [...order], current: node.value },
            notes: ["Visitamos o nó antes dos filhos"],
          },
        ),
      )
  preorder(node.left ?? null)
  preorder(node.right ?? null)
    }

    const postorder = (node: TreeNode | null) => {
      if (!node) return
  postorder(node.left ?? null)
  postorder(node.right ?? null)
      order.push(node.value)
      steps.push(
        this.createStep(
          "traverse",
          `Visitando ${node.value}`,
          this.root,
          [node.id],
          [],
          `Percurso postorder: visitando ${node.value}. Ordem: ${order.join(", ")}`,
          {
            metadata: { traversalType: "postorder", orderSnapshot: [...order], current: node.value },
            notes: ["Nó visitado após os filhos"],
          },
        ),
      )
    }

    switch (type) {
      case "inorder":
        inorder(this.root)
        break
      case "preorder":
        preorder(this.root)
        break
      case "postorder":
        postorder(this.root)
        break
      case "levelorder": {
        const queue: TreeNode[] = []
        if (this.root) queue.push(this.root)
        while (queue.length > 0) {
          const node = queue.shift()
          if (node) {
            order.push(node.value)
            steps.push(
              this.createStep(
                "traverse",
                `Visitando ${node.value}`,
                this.root,
                [node.id],
                [],
                `Percurso por nível: visitando ${node.value}. Ordem: ${order.join(", ")}`,
                {
                  metadata: { traversalType: "levelorder", orderSnapshot: [...order], current: node.value },
                  notes: ["Percorremos nós nível a nível usando fila"],
                },
              ),
            )
            if (node.left) queue.push(node.left)
            if (node.right) queue.push(node.right)
          }
        }
        break
      }
    }

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
      id: `step-${Date.now()}`,
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

  getTree(): TreeNode | null {
    return this.root
  }

  clear(): void {
    this.root = null
    this.nodeCounter = 0
  }
}
