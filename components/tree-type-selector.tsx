"use client"

import type { TreeType } from "@/types"

interface TreeTypeSelectorProps {
  selectedType: TreeType
  onTypeChange: (type: TreeType) => void
}

export default function TreeTypeSelector({ selectedType, onTypeChange }: TreeTypeSelectorProps) {
  const treeTypes: { id: TreeType; label: string }[] = [
    { id: "binary", label: "Árvore Binária" },
    { id: "heap", label: "Heap" },
    { id: "avl", label: "Árvore AVL" },
    { id: "redblack", label: "Red-Black" },
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-black block">Tipo de Árvore</label>
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value as TreeType)}
        className="w-full px-3 py-2 bg-white text-black border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black font-semibold text-sm"
      >
        {treeTypes.map((tree) => (
          <option key={tree.id} value={tree.id}>
            {tree.label}
          </option>
        ))}
      </select>
    </div>
  )
}
