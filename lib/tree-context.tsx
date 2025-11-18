"use client"

import type React from "react"

import { createContext, useContext, useMemo, useState } from "react"
import { BinaryTree } from "@/lib/tree-algorithms/binary-tree"
import { MinHeap } from "@/lib/tree-algorithms/heap"
import { AVLTree } from "@/lib/tree-algorithms/avl-tree"
import { RedBlackTree } from "@/lib/tree-algorithms/red-black-tree"
import type { VisualizationStep } from "@/types"

type OperationHistoryType = "insert" | "remove" | "search" | "sort"

interface GlobalOperation {
  type: OperationHistoryType
  value?: number
  steps: VisualizationStep[]
}

interface TreeContextType {
  trees: {
    binary: BinaryTree
    heap: MinHeap
    avl: AVLTree
    redblack: RedBlackTree
  }
  operations: GlobalOperation[]
  addOperation: (operation: GlobalOperation) => void
  clearOperations: () => void
  getAllAccumulatedSteps: () => VisualizationStep[]
  getOperationsByType: (type: OperationHistoryType) => VisualizationStep[]
}

const TreeContext = createContext<TreeContextType | undefined>(undefined)

export function TreeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [trees] = useState({
    binary: new BinaryTree(),
    heap: new MinHeap(),
    avl: new AVLTree(),
    redblack: new RedBlackTree(),
  })

  const [operations, setOperations] = useState<GlobalOperation[]>([])

  const addOperation = (operation: GlobalOperation) => {
    setOperations((prev) => [...prev, operation])
  }

  const clearOperations = () => {
    setOperations([])
    trees.binary.clear()
    trees.heap.clear()
    trees.avl.clear()
    trees.redblack.clear()
  }

  const getAllAccumulatedSteps = () => {
    const accumulatedSteps: VisualizationStep[] = []
    for (const operation of operations) {
      accumulatedSteps.push(...operation.steps)
    }
    return accumulatedSteps
  }

  const getOperationsByType = (type: OperationHistoryType) => {
    const accumulatedSteps: VisualizationStep[] = []
    for (const operation of operations) {
      if (operation.type === type) {
        accumulatedSteps.push(...operation.steps)
      }
    }
    return accumulatedSteps
  }

  const contextValue = useMemo(
    () => ({ trees, operations, addOperation, clearOperations, getAllAccumulatedSteps, getOperationsByType }),
    [operations],
  )

  return <TreeContext.Provider value={contextValue}>{children}</TreeContext.Provider>
}

export function useTreeContext() {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error("useTreeContext deve ser usado dentro de TreeProvider")
  }
  return context
}
