"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import type { TreeType, TreeNode, VisualizationStep } from "@/types"
import { useTreeContext } from "@/lib/tree-context"
import StepInfoPanel from "./step-info-panel"

interface TreeVisualizerProps {
  treeType: TreeType
  steps: VisualizationStep[]
  currentStep: number
  onStepChange: (step: number) => void
}

interface NodePosition {
  x: number
  y: number
  node: TreeNode
}

export default function TreeVisualizer({
  treeType,
  steps,
  currentStep,
  onStepChange,
}: Readonly<TreeVisualizerProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [replayType, setReplayType] = useState<"all" | "insert" | "remove" | "search">("all")
  const { operations } = useTreeContext()
  const activeStep = steps[currentStep] ?? null
  const rotationLabel = useMemo(() => {
    if (!activeStep) return null
    const metadataRotation =
      typeof activeStep.metadata?.rotation === "string" ? activeStep.metadata.rotation : undefined
    if (metadataRotation) {
      return `Rotação ${metadataRotation.toUpperCase()}`
    }
    if (activeStep.description.toLowerCase().includes("rotação")) {
      return activeStep.description
    }
    return null
  }, [activeStep])

  useEffect(() => {
    if (!isAnimating || steps.length === 0) return

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        onStepChange(currentStep + 1)
      } else {
        setIsAnimating(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAnimating, steps.length, currentStep, onStepChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight - 80
      setCanvasSize({ width, height })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleCanvasWheel = (e: WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(3, scale * zoomFactor))
    const scaleDiff = newScale - scale

    setOffsetX(offsetX - (mouseX - offsetX) * (scaleDiff / scale))
    setOffsetY(offsetY - (mouseY - offsetY) * (scaleDiff / scale))
    setScale(newScale)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    setOffsetX(e.clientX - dragStart.x)
    setOffsetY(e.clientY - dragStart.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleReplayFiltered = () => {
    if (steps.length === 0) return
    onStepChange(0)
    setIsAnimating(true)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (steps.length === 0) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "#f0f0f0"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }
      return
    }

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#f0f0f0"
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    const step = activeStep
    if (step?.tree) {
      const positions: NodePosition[] = []
      calculatePositions(step.tree, canvas.width / 2 / scale, 40, 150, positions)

      drawEdges(ctx, positions, step.highlightedNodes)
      drawNodes(ctx, positions, step.highlightedNodes, treeType, step)
    }

    ctx.restore()

    ctx.fillStyle = "#000000"
    ctx.font = "bold 12px monospace"
    ctx.fillText(
      `Passo ${currentStep + 1}/${steps.length} | Zoom: ${(scale * 100).toFixed(0)}% | Arraste para mover`,
      10,
      canvas.height - 10,
    )

    if (step?.type === "search" && step?.highlightedNodes && step.highlightedNodes.length > 0) {
      const positions: NodePosition[] = []
      if (step.tree) calculatePositions(step.tree, canvas.width / 2 / scale, 40, 150, positions)

      const pathValues: number[] = []
      for (const nodeId of step.highlightedNodes) {
        const pos = positions.find((p) => p.node.id === nodeId)
        if (pos) {
          pathValues.push(pos.node.value)
        }
      }

      if (pathValues.length > 0) {
        const path = pathValues.join(" → ")
        ctx.fillStyle = "#000000"
        ctx.font = "bold 14px monospace"
        ctx.fillText(`Caminho: ${path}`, 10, canvas.height - 30)
      }
    }
  }, [steps, currentStep, treeType, offsetX, offsetY, scale, containerRef, activeStep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener("wheel", handleCanvasWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleCanvasWheel)
  }, [scale, offsetX, offsetY])

  const calculatePositions = (
    node: TreeNode | null,
    x: number,
    y: number,
    offset: number,
    positions: NodePosition[],
  ) => {
    if (!node) return

    positions.push({ x, y, node })

    if (node.left) {
      calculatePositions(node.left, x - offset, y + 80, offset * 0.7, positions)
    }
    if (node.right) {
      calculatePositions(node.right, x + offset, y + 80, offset * 0.7, positions)
    }
  }

  const drawEdges = (ctx: CanvasRenderingContext2D, positions: NodePosition[], highlighted: string[]) => {
    for (const { x, y, node } of positions) {
      const isHighlighted = highlighted.includes(node.id)

      if (node.left) {
        const leftNode = positions.find((p) => p.node === node.left)
        if (leftNode) {
          ctx.strokeStyle = isHighlighted ? "#000000" : "#999999"
          ctx.lineWidth = isHighlighted ? 4 : 2
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(leftNode.x, leftNode.y)
          ctx.stroke()
        }
      }

      if (node.right) {
        const rightNode = positions.find((p) => p.node === node.right)
        if (rightNode) {
          ctx.strokeStyle = isHighlighted ? "#000000" : "#999999"
          ctx.lineWidth = isHighlighted ? 4 : 2
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(rightNode.x, rightNode.y)
          ctx.stroke()
        }
      }
    }
  }

  const drawNodes = (
    ctx: CanvasRenderingContext2D,
    positions: NodePosition[],
    highlighted: string[],
    type: TreeType,
    step: VisualizationStep,
  ) => {
    const nodeRadius = 25

    for (const { x, y, node } of positions) {
      const isHighlighted = highlighted.includes(node.id)

      if (type === "redblack") {
        if (node.color === "red") {
          ctx.fillStyle = "#EF4444"
        } else {
          ctx.fillStyle = "#1F2937"
        }
      } else {
        ctx.fillStyle = isHighlighted ? "#ffeb3b" : "#ffffff"
      }

      ctx.beginPath()
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      if (isHighlighted && step?.type === "search") {
        ctx.strokeStyle = "#0066ff"
        ctx.lineWidth = 5
      } else if (isHighlighted) {
        ctx.strokeStyle = "#ff9800"
        ctx.lineWidth = 5
      } else {
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2.5
      }
      ctx.stroke()
      ctx.shadowColor = "transparent"

      if (type === "redblack") {
        ctx.fillStyle = "#ffffff"
      } else {
        ctx.fillStyle = "#000000"
      }

      ctx.font = "bold 18px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.value.toString(), x, y)

      if (type === "avl" && node.balanceFactor !== undefined) {
        ctx.fillStyle = "#000000"
        ctx.font = "11px monospace"
        ctx.fillText(`BF:${node.balanceFactor}`, x, y + 40)
      }

      if (type === "redblack" && node.color) {
        ctx.fillStyle = "#000000"
        ctx.font = "bold 10px monospace"
        ctx.fillText(node.color.toUpperCase(), x, y - 40)
      }
    }
  }

  const availableReplayTypes = [
    { value: "all", label: "Tudo", hasOps: true },
    { value: "insert", label: "Inserções", hasOps: operations.some((op) => op.type === "insert") },
    { value: "remove", label: "Remoções", hasOps: operations.some((op) => op.type === "remove") },
    { value: "search", label: "Buscas", hasOps: operations.some((op) => op.type === "search") },
  ]

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-white relative">
      {rotationLabel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold shadow-lg z-30">
          {rotationLabel}
        </div>
      )}
      <div className="flex-1 overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-full block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="bg-gray-50 border-t border-black px-3 py-2 overflow-y-auto max-h-48">
        <StepInfoPanel step={activeStep ?? null} treeType={treeType} />
      </div>

      <div className="bg-white border-t-2 border-black p-2 md:p-3 flex flex-wrap gap-2 md:gap-3 justify-center items-center overflow-x-auto">
        <select
          value={replayType}
          onChange={(e) => setReplayType(e.target.value as any)}
          className="px-2 md:px-3 py-2 bg-white text-black border-2 border-black rounded focus:outline-none font-semibold text-xs md:text-sm"
        >
          {availableReplayTypes.map((type) => (
            <option key={type.value} value={type.value} disabled={type.value !== "all" && !type.hasOps}>
              {type.label} {type.value !== "all" && !type.hasOps ? "(nenhuma)" : ""}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setOffsetX(0)
            setOffsetY(0)
            setScale(1)
          }}
          title="Reset"
          className="px-3 py-2 bg-black border-2 border-black hover:bg-gray-800 text-white rounded font-semibold transition text-xs md:text-sm whitespace-nowrap"
        >
          ↺ Reset
        </button>

        <button
          onClick={() => onStepChange(0)}
          disabled={steps.length === 0 || currentStep === 0}
          className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100 disabled:opacity-50 text-black rounded font-semibold transition text-sm"
          title="Primeira"
        >
          ⏮
        </button>

        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={steps.length === 0 || currentStep === 0}
          className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100 disabled:opacity-50 text-black rounded font-semibold transition text-xs md:text-sm"
          title="Anterior"
        >
          ◀
        </button>

        <span className="text-black font-mono font-bold px-3 py-2 bg-gray-100 border-2 border-black rounded text-xs md:text-sm">
          {steps.length > 0 ? `${currentStep + 1}/${steps.length}` : "—"}
        </span>

        <button
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
          disabled={steps.length === 0 || currentStep === steps.length - 1}
          className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100 disabled:opacity-50 text-black rounded font-semibold transition text-xs md:text-sm"
          title="Próxima"
        >
          ▶
        </button>

        <button
          onClick={() => onStepChange(steps.length - 1)}
          disabled={steps.length === 0 || currentStep === steps.length - 1}
          className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100 disabled:opacity-50 text-black rounded font-semibold transition text-sm"
          title="Última"
        >
          ⏭
        </button>

        <button
          onClick={handleReplayFiltered}
          disabled={steps.length === 0}
          className="px-3 md:px-4 py-2 bg-black border-2 border-black hover:bg-gray-800 disabled:opacity-50 text-white font-semibold rounded transition text-xs md:text-sm whitespace-nowrap"
          title="Reproduzir tipo selecionado"
        >
          {isAnimating ? "⏸ Pausando" : "▶ Reproduzir"}
        </button>
      </div>
    </div>
  )
}
