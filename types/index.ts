export type TreeType = "binary" | "heap" | "avl" | "redblack"
export type OperationType = "insert" | "remove" | "search" | "traverse" | "sort"
export type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder"

export interface TreeNode {
  id: string
  value: number
  left?: TreeNode
  right?: TreeNode
  parent?: TreeNode
  color?: "red" | "black" // Para Red-Black Tree
  height?: number // Para AVL Tree
  balanceFactor?: number // Para AVL Tree
  x?: number
  y?: number
}

export interface VisualizationStep {
  id: string
  type: OperationType
  description: string
  tree: TreeNode | null
  highlightedNodes: string[]
  highlightedEdges: string[]
  explanation: string
  timestamp: number
  sortedElements?: number[] // Adicionado campo para elementos ordenados no Heap Sort
  arraySnapshot?: number[] // Estado intermediário de arrays durante execuções
  notes?: string[]
  severity?: "info" | "warning" | "error"
  ruleBroken?: string
  metadata?: Record<string, unknown>
}

export interface TraversalStep {
  nodeId: string
  order: number
  action: "visit" | "enter" | "exit"
}
