"use client"

import { useState } from "react"
import TreeVisualizer from "@/components/tree-visualizer"
import ControlPanel from "@/components/control-panel"
import TreeTypeSelector from "@/components/tree-type-selector"
import type { TreeType, VisualizationStep } from "@/types"
import { useTreeContext } from "@/lib/tree-context"

export default function Home() {
  const [treeType, setTreeType] = useState<TreeType>("binary")
  const [steps, setSteps] = useState<VisualizationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const { clearOperations } = useTreeContext()

  const handleTreeTypeChange = (type: TreeType) => {
    setTreeType(type)
    clearOperations()
    setSteps([])
    setCurrentStep(0)
  }

  const handleClear = () => {
    clearOperations()
    setSteps([])
    setCurrentStep(0)
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-white border-2 border-black">
      <div className="bg-white border-b-2 border-black px-4 md:px-6 py-2">
        <h1 className="text-lg md:text-xl font-black text-black">Visualizador de Árvores</h1>
      </div>

      <div className="flex-1 overflow-hidden flex gap-2 md:gap-4 px-2 md:px-4 py-2">
        <div className="hidden sm:flex flex-col gap-2 md:gap-3 w-56 md:w-64">
          <div className="bg-white border-2 border-black rounded p-3">
            <TreeTypeSelector selectedType={treeType} onTypeChange={handleTreeTypeChange} />
          </div>

          <div className="bg-white border-2 border-black rounded p-3 flex-1 overflow-y-auto">
            <ControlPanel treeType={treeType} onStepsChange={setSteps} onCurrentStepChange={setCurrentStep} />
          </div>

          <button
            onClick={handleClear}
            className="w-full bg-black border-2 border-black hover:bg-gray-800 text-white font-semibold py-2 px-3 rounded transition text-xs md:text-sm"
          >
            🗑 Limpar Tudo
          </button>
        </div>

        <div className="flex-1 bg-white border-2 border-black rounded overflow-hidden relative flex flex-col">
          <TreeVisualizer
            treeType={treeType}
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-2 max-h-32 overflow-y-auto z-40">
          <ControlPanel treeType={treeType} onStepsChange={setSteps} onCurrentStepChange={setCurrentStep} />
          <button
            onClick={handleClear}
            className="w-full bg-black border-2 border-black hover:bg-gray-800 text-white font-semibold py-2 px-3 rounded transition text-xs mt-2"
          >
            🗑 Limpar Tudo
          </button>
        </div>
      </div>
    </div>
  )
}
