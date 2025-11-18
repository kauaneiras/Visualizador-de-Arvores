"use client"

import { useState } from "react"
import type { VisualizationStep } from "@/types"

interface HistoryMenuProps {
  steps: VisualizationStep[]
  currentStep: number
  onStepChange: (step: number) => void
}

export default function HistoryMenu({ steps, currentStep, onStepChange }: HistoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  const handleSelectStep = (index: number) => {
    onStepChange(index)
    setSelectedStep(index)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-3 right-3 bg-white border-2 border-black px-3 py-2 font-bold text-black hover:bg-gray-100 transition whitespace-nowrap text-sm rounded-lg z-50`}
        title={isOpen ? "Fechar histórico" : "Abrir histórico"}
      >
        {isOpen ? "◀ Histórico" : "Histórico ▶"}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/10 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute top-14 right-3 bg-white border-2 border-black rounded-lg w-80 max-h-[calc(100vh-120px)] flex flex-col z-50 shadow-lg">
            <div className="border-b-2 border-black p-3 bg-gray-50">
              <div className="font-bold text-black text-sm">Histórico de Passos</div>
              <div className="text-xs text-gray-600 mt-1">
                {steps.length > 0 ? `${currentStep + 1} de ${steps.length}` : "Nenhum passo"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {steps.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm font-medium">Nenhum passo registrado</p>
                  <p className="text-xs mt-2">Execute uma operação para ver o histórico</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleSelectStep(index)}
                      className={`w-full text-left p-3 transition border-l-4 ${
                        currentStep === index
                          ? "bg-black text-white border-l-black"
                          : "bg-white text-black hover:bg-gray-50 border-l-white"
                      }`}
                    >
                      <div className="font-semibold text-xs">Passo {index + 1}</div>
                      <div className="text-xs opacity-90 mt-1 font-medium">{step.type.toUpperCase()}</div>
                      <div className="text-xs opacity-80 mt-1">{step.description}</div>
                      <div className="text-xs opacity-70 mt-2 italic border-t border-current pt-2 mt-2">
                        {step.explanation}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
