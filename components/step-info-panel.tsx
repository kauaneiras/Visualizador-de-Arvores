"use client"

import type { VisualizationStep, TreeType } from "@/types"

interface StepInfoPanelProps {
  step: VisualizationStep | null
  treeType: TreeType
}

export default function StepInfoPanel({ step, treeType }: Readonly<StepInfoPanelProps>) {
  if (!step) {
    return (
      <div className="text-xs md:text-sm text-gray-700">
        <p>Comece inserindo um valor na árvore.</p>
      </div>
    )
  }

  const metadata = step.metadata
  const rotation = typeof metadata?.rotation === "string" ? metadata.rotation : undefined
  const pivot =
    typeof metadata?.pivot === "number" || typeof metadata?.pivot === "string" ? metadata.pivot : undefined
  const iteration = typeof metadata?.iteration === "number" ? metadata.iteration : undefined
  const totalIterations = typeof metadata?.totalIterations === "number" ? metadata.totalIterations : undefined
  const visitedCount = typeof metadata?.visitedCount === "number" ? metadata.visitedCount : undefined
  const complexity = typeof metadata?.complexity === "string" ? metadata.complexity : undefined
  const rawPathSequence = metadata?.pathSequence
  const pathSequence = Array.isArray(rawPathSequence) ? (rawPathSequence as Array<string | number>) : undefined

  return (
    <div className="space-y-3 text-xs md:text-sm">
      <div>
        <h3 className="font-bold text-black mb-1">{step.type.toUpperCase()}</h3>
        <p className="text-gray-800">{step.description}</p>
      </div>

      <div className="bg-gray-100 rounded p-2 border-2 border-black">
        <h4 className="text-black font-semibold mb-1 text-xs">Explicação</h4>
        <p className="text-gray-800 text-xs">{step.explanation}</p>
      </div>

      {step.notes && step.notes.length > 0 && (
        <div className="bg-white rounded p-2 border border-dashed border-black">
          <h4 className="text-black font-semibold mb-1 text-xs">Notas do passo</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-800 text-xs">
            {step.notes.map((note, index) => (
              <li key={`${step.id}-note-${index}`}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {rotation && (
        <div className="bg-green-50 border border-green-500 rounded p-2 text-xs">
          <p className="font-semibold text-green-700">Rotação {rotation.toUpperCase()}</p>
          {pivot !== undefined && <p className="text-green-700">Pivô: {pivot}</p>}
        </div>
      )}

      {(iteration !== undefined || visitedCount !== undefined || complexity || pathSequence) && (
        <div className="bg-blue-50 border border-blue-600 rounded p-2 text-xs space-y-1">
          <p className="font-semibold text-blue-900">Progresso passo-a-passo</p>
          {iteration !== undefined && (
            <p className="text-blue-900">• Iteração atual: {iteration}</p>
          )}
          {totalIterations !== undefined && (
            <p className="text-blue-900">• Iterações totais até agora: {totalIterations}</p>
          )}
          {visitedCount !== undefined && <p className="text-blue-900">• Nós visitados: {visitedCount}</p>}
          {complexity && <p className="text-blue-900">• Complexidade: {complexity}</p>}
          {pathSequence && pathSequence.length > 0 && (
            <p className="text-blue-900">
              • Caminho acumulado: {pathSequence.join(" → ")}
            </p>
          )}
        </div>
      )}

      <div className="bg-gray-50 rounded p-2 border border-black text-xs">
        {treeType === "avl" && (
          <div className="text-gray-800">
            <p>• Auto-balanceada: BF entre -1 e 1</p>
            <p>• O(log n) para operações</p>
          </div>
        )}
        {treeType === "redblack" && (
          <div className="text-gray-800">
            <p>• Nós vermelhos ou pretos</p>
            <p>• O(log n) garantido</p>
          </div>
        )}
        {treeType === "binary" && (
          <div className="text-gray-800">
            <p>• Sem balanceamento: Pode ficar desbalanceada</p>
            <p>• Ordem: Esquerda &lt; Pai &lt; Direita</p>
            <p>• Complexidade: O(log n) ideal, O(n) pior caso</p>
          </div>
        )}
        {treeType === "heap" && (
          <div className="text-gray-800">
            <p>• Min-Heap: Pai menor que filhos</p>
            <p>• Completa: Todos níveis preenchidos</p>
            <p>• Complexidade: O(log n) inserir/remover</p>
          </div>
        )}
      </div>
    </div>
  )
}
