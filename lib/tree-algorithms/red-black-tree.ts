import type { TreeNode, VisualizationStep } from "@/types"

type StepExtras = Partial<
  Pick<VisualizationStep, "arraySnapshot" | "notes" | "severity" | "ruleBroken" | "metadata" | "sortedElements">
>

/**
 * Red-Black Tree - Árvore Binária de Busca auto-balanceada
 * Propriedades:
 * 1. Todo nó é vermelho ou preto
 * 2. Raiz é preta
 * 3. Todas as folhas (NIL) são pretas
 * 4. Se nó é vermelho, seus filhos são pretos
 * 5. Todos os caminhos da raiz às folhas têm mesmo número de nós pretos
 */
export class RedBlackTree {
  root: TreeNode | null = null
  private nodeCounter = 0

  private generateId(): string {
    return `rbt-${this.nodeCounter++}`
  }

  private createNode(value: number, color: "red" | "black" = "red"): TreeNode {
    return {
      id: this.generateId(),
      value,
      color,
    }
  }

  /**
   * Rotação à esquerda com captura de passo
   */
  private rotateLeft(node: TreeNode, steps: VisualizationStep[]): TreeNode {
    const right = node.right!
    node.right = right.left
    if (right.left) {
      right.left.parent = node
    }
    right.parent = node.parent
    
    // Atualizar parent para apontar para o novo nó
    if (!node.parent) {
      this.root = right
    } else if (node === node.parent.left) {
      node.parent.left = right
    } else {
      node.parent.right = right
    }
    
    right.left = node
    node.parent = right

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
          notes: [
            "Filho direito assume a posição do pai",
            "Aplicamos rotação simples para corrigir desequilíbrio",
          ],
        },
      ),
    )

    return right
  }

  /**
   * Rotação à direita com captura de passo
   */
  private rotateRight(node: TreeNode, steps: VisualizationStep[]): TreeNode {
    const left = node.left!
    node.left = left.right
    if (left.right) {
      left.right.parent = node
    }
    left.parent = node.parent
    
    // Atualizar parent para apontar para o novo nó
    if (!node.parent) {
      this.root = left
    } else if (node === node.parent.right) {
      node.parent.right = left
    } else {
      node.parent.left = left
    }
    
    left.right = node
    node.parent = left

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
          notes: ["Filho esquerdo sobe", "Correção de desequilíbrio com rotação simples"],
        },
      ),
    )

    return left
  }

  insert(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []

    if (!this.root) {
      this.root = this.createNode(value, "black")
      steps.push(
        this.createStep(
          "insert",
          `Inserir ${value} como raiz (preto)`,
          this.root,
          [this.root.id],
          [],
          `Raiz criada como preta`,
        ),
      )
      return steps
    }

    let current = this.root
    let parent: TreeNode | null = null
    let newNode: TreeNode | null = null

    // Encontrar posição de inserção
    while (current) {
      parent = current
      if (value < current.value) {
        current = current.left ?? null
      } else if (value > current.value) {
        current = current.right ?? null
      } else {
        steps.push(
          this.createStep(
            "insert",
            `❌ Erro: Valor ${value} já existe`,
            this.root,
            [],
            [],
            `Violação de regra Red-Black: Não são permitidos valores duplicados em uma árvore de busca binária (propriedade fundamental de BST)`,
            {
              severity: "error",
              ruleBroken: "Regra fundamental de BST",
              notes: ["Cada valor deve ser único", "Duplicatas quebram a propriedade de busca"],
            },
          ),
        )
        return steps
      }
    }

    // Criar novo nó (sempre vermelho)
  newNode = this.createNode(value, "red")
  newNode.parent = parent ?? undefined

    if (value < parent!.value) {
      parent!.left = newNode
    } else {
      parent!.right = newNode
    }

    steps.push(
      this.createStep(
        "insert",
        `${value} inserido como vermelho`,
        this.root,
        [newNode.id],
        [],
        `Novo nó vermelho adicionado`,
      ),
    )

    this.fixInsert(newNode, steps)

    steps.push(
      this.createStep("insert", `${value} inserido com sucesso`, this.root, [], [], `Árvore Red-Black balanceada`),
    )
    return steps
  }

  private fixInsert(node: TreeNode, steps: VisualizationStep[]): void {
    let current = node

    while (current.parent && current.parent.color === "red") {
      if (current.parent.parent?.left === current.parent) {
        const uncle = current.parent.parent.right

        if (uncle && uncle.color === "red") {
          // Caso 1: Tio é vermelho - Recoloração
          steps.push(
            this.createStep(
              "insert",
              `Caso 1: Tio é vermelho - Recolorindo`,
              this.root,
              [current.id, current.parent.id, uncle.id],
              [],
              `Tio ${uncle.value} e pai ${current.parent.value} ficam pretos, avô fica vermelho`,
            ),
          )
          current.parent.color = "black"
          uncle.color = "black"
          current.parent.parent!.color = "red"

          steps.push(
            this.createStep(
              "insert",
              `Cores atualizadas após recoloração`,
              this.root,
              [current.parent.parent!.id],
              [],
              `Movendo para verificar avó`,
            ),
          )

          current = current.parent.parent!
        } else {
          // Caso 2 e 3: Tio é preto
          if (current === current.parent.right) {
            // Caso 2: Triângulo - Rotação esquerda
            steps.push(
              this.createStep(
                "insert",
                `Caso 2: Triângulo vermelho - Rotação esquerda`,
                this.root,
                [current.id, current.parent.id],
                [],
                `Transformando triângulo em linha`,
              ),
            )
            current = current.parent
            this.rotateLeft(current, steps)
          }

          // Caso 3: Linha - Rotação direita e recoloração
          steps.push(
            this.createStep(
              "insert",
              `Caso 3: Linha vermelha - Rotação direita`,
              this.root,
              [current.id, current.parent.id],
              [],
              `Balanceando com rotação`,
            ),
          )

          current.parent!.color = "black"
          current.parent!.parent!.color = "red"

          steps.push(
            this.createStep(
              "insert",
              `Cores alteradas antes de rotação`,
              this.root,
              [current.parent!.id, current.parent!.parent!.id],
              [],
              `Pai fica preto, avó fica vermelho`,
            ),
          )

          this.rotateRight(current.parent!.parent!, steps)
          break
        }
      } else {
        const uncle = current.parent.parent?.left

        if (uncle && uncle.color === "red") {
          // Caso 1: Tio é vermelho
          steps.push(
            this.createStep(
              "insert",
              `Caso 1: Tio é vermelho - Recolorindo`,
              this.root,
              [current.id, current.parent.id, uncle.id],
              [],
              `Tio ${uncle.value} e pai ${current.parent.value} ficam pretos`,
            ),
          )
          current.parent.color = "black"
          uncle.color = "black"
          current.parent.parent!.color = "red"

          steps.push(
            this.createStep(
              "insert",
              `Cores atualizadas após recoloração`,
              this.root,
              [current.parent.parent!.id],
              [],
              `Movendo para verificar avó`,
            ),
          )

          current = current.parent.parent!
        } else {
          // Caso 2 e 3: Tio é preto
          if (current === current.parent.left) {
            // Caso 2: Triângulo
            steps.push(
              this.createStep(
                "insert",
                `Caso 2: Triângulo vermelho - Rotação direita`,
                this.root,
                [current.id, current.parent.id],
                [],
                `Transformando triângulo em linha`,
              ),
            )
            current = current.parent
            this.rotateRight(current, steps)
          }

          // Caso 3: Linha
          steps.push(
            this.createStep(
              "insert",
              `Caso 3: Linha vermelha - Rotação esquerda`,
              this.root,
              [current.id, current.parent.id],
              [],
              `Balanceando com rotação`,
            ),
          )

          current.parent!.color = "black"
          current.parent!.parent!.color = "red"

          steps.push(
            this.createStep(
              "insert",
              `Cores alteradas antes de rotação`,
              this.root,
              [current.parent!.id, current.parent!.parent!.id],
              [],
              `Pai fica preto, avó fica vermelho`,
            ),
          )

          this.rotateLeft(current.parent!.parent!, steps)
          break
        }
      }
    }

    // Garantir que raiz é preta
    if (this.root && this.root.color !== "black") {
      this.root.color = "black"
      steps.push(
        this.createStep("insert", `Raiz recolorida para preta`, this.root, [this.root.id], [], `Propriedade 2 mantida`),
      )
    }
  }

  remove(value: number): VisualizationStep[] {
    const steps: VisualizationStep[] = []
    const nodeToDelete = this.findNode(value)

    if (!nodeToDelete) {
      steps.push(this.createStep("remove", `Valor ${value} não encontrado`, this.root, [], [], `Nó não existe`))
      return steps
    }

    steps.push(this.createStep("remove", `Encontrado ${value}`, this.root, [nodeToDelete.id], [], `Iniciando remoção`))

    // Nó com dois filhos
    if (nodeToDelete.left && nodeToDelete.right) {
      let successor = nodeToDelete.right
      while (successor.left) {
        successor = successor.left
      }
      steps.push(
        this.createStep(
          "remove",
          `Sucessor encontrado: ${successor.value}`,
          this.root,
          [nodeToDelete.id, successor.id],
          [],
          `Usando successor`,
          {
            notes: ["Nó com dois filhos", "Copiamos valor do sucessor inorder"],
          },
        ),
      )

      nodeToDelete.value = successor.value
      const removeSteps = this.remove(successor.value)
      steps.push(...removeSteps)
      return steps
    }

    // Nó com no máximo um filho
    const child = nodeToDelete.left ?? nodeToDelete.right

    if (child) {
      child.parent = nodeToDelete.parent
    }

    if (nodeToDelete.parent) {
      if (nodeToDelete.parent.left === nodeToDelete) {
        nodeToDelete.parent.left = child
      } else {
        nodeToDelete.parent.right = child
      }
    } else {
      this.root = child ?? null
    }

    steps.push(
      this.createStep("remove", `${value} removido com sucesso`, this.root, [], [], `Árvore Red-Black balanceada`),
    )
    return steps
  }

  private findNode(value: number): TreeNode | null {
    let current = this.root
    while (current) {
      if (current.value === value) {
        return current
      }
      if (value < current.value) {
        current = current.left ?? null
      } else {
        current = current.right ?? null
      }
    }
    return null
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
          `Iteração ${iteration}: visitando ${current.value} (${current.color})`,
          this.root,
          highlightedPath,
          [],
          `Iteração ${iteration} — Procurando ${value}. Caminho: ${pathSequence.join(" → ")}`,
          {
            notes: [
              `Iteração ${iteration}`,
              `Comparando ${value} com ${current.value}`,
              directionNote,
              `Cor atual: ${current.color?.toUpperCase()}`,
              `Complexidade esperada: ${complexityLabel}`,
            ],
            metadata: {
              target: value,
              pathSequence: [...pathSequence],
              color: current.color,
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
            `Valor localizado após ${iteration} iteração(ões)! Caminho: ${pathSequence.join(" → ")}`,
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
          `Visitando ${node.value} (${node.color})`,
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
}
