"use client"

import { useState } from "react"
import type { TreeType } from "@/types"
import { useTreeContext } from "@/lib/tree-context"

interface ControlPanelProps {
  treeType: TreeType
  onStepsChange: (steps: any[]) => void
  onCurrentStepChange: (step: number) => void
}

export default function ControlPanel({
  treeType,
  onStepsChange,
  onCurrentStepChange,
}: ControlPanelProps) {
  const [inputValue, setInputValue] = useState("")
  const [heapType, setHeapType] = useState("min")
  const { trees, operations, addOperation } = useTreeContext()

  const handleInsert = () => {
    const values = inputValue
      .split(",")
      .map((v) => Number.parseInt(v.trim()))
      .filter((v) => !isNaN(v) && v >= 0 && v <= 100)

    if (values.length === 0) {
      alert("Digite números válidos entre 0 e 100, separados por vírgula")
      return
    }

    let allSteps: any[] = []

    values.forEach((value) => {
      let steps: any[] = []

      if (treeType === "binary") {
        steps = trees.binary.insert(value)
      } else if (treeType === "heap") {
        steps = trees.heap.insert(value)
      } else if (treeType === "avl") {
        steps = trees.avl.insert(value)
      } else if (treeType === "redblack") {
        steps = trees.redblack.insert(value)
      }

      allSteps.push(...steps)

      addOperation({
        type: "insert",
        value,
        steps,
      })
    })

    onStepsChange(allSteps)
    if (allSteps.length > 0) {
      onCurrentStepChange(allSteps.length - 1)
    }
    setInputValue("")
  }

  const handleRemove = () => {
    const value = Number.parseInt(inputValue)
    if (isNaN(value)) {
      alert("Digite um número válido")
      return
    }

    let steps: any[] = []

    if (treeType === "binary") {
      steps = trees.binary.remove(value)
    } else if (treeType === "heap") {
      steps = trees.heap.remove()
    } else if (treeType === "avl") {
      steps = trees.avl.remove(value)
    } else if (treeType === "redblack") {
      steps = trees.redblack.remove(value)
    }

    addOperation({
      type: "remove",
      value,
      steps,
    })

    onStepsChange(steps)
    if (steps.length > 0) {
      onCurrentStepChange(steps.length - 1)
    }
    setInputValue("")
  }

  const handleSearch = () => {
    const value = Number.parseInt(inputValue)
    if (isNaN(value)) {
      alert("Digite um número válido")
      return
    }

    let steps: any[] = []

    if (treeType === "binary") {
      steps = trees.binary.search(value)
    } else if (treeType === "heap") {
      steps = trees.heap.search(value)
    } else if (treeType === "avl") {
      steps = trees.avl.search(value)
    } else if (treeType === "redblack") {
      steps = trees.redblack.search(value)
    }

    addOperation({
      type: "search",
      value,
      steps,
    })

    onStepsChange(steps)
    if (steps.length > 0) {
      onCurrentStepChange(0)
    }
    setInputValue("")
  }

  return (
    <div className="space-y-3">
      {treeType === "heap" && (
        <div>
          <label className="text-black font-semibold text-xs md:text-sm block mb-1">Tipo de Heap</label>
          <select
            value={heapType}
            onChange={(e) => {
              setHeapType(e.target.value)
              trees.heap.setHeapType(e.target.value as "min" | "max")
            }}
            className="w-full px-2 md:px-3 py-2 bg-white text-black rounded border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-xs md:text-sm"
          >
            <option value="min">Min Heap</option>
            <option value="max">Max Heap</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleInsert()}
          placeholder="Número ou: 1,5,3,7"
          className="w-full px-2 md:px-3 py-2 bg-white text-black rounded border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-xs md:text-sm"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleInsert}
            className="bg-white border-2 border-black hover:bg-gray-100 text-black font-semibold py-1 md:py-2 px-2 md:px-3 rounded transition text-xs md:text-sm"
          >
            + Inserir
          </button>
          <button
            onClick={handleRemove}
            className="bg-white border-2 border-black hover:bg-gray-100 text-black font-semibold py-1 md:py-2 px-2 md:px-3 rounded transition text-xs md:text-sm"
          >
            - Remover
          </button>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-white border-2 border-black hover:bg-gray-100 text-black font-semibold py-1 md:py-2 px-2 md:px-3 rounded transition text-xs md:text-sm"
        >
          🔍 Buscar
        </button>
      </div>
    </div>
  )
}
