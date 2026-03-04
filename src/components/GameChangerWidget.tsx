"use client"

import { useEffect, useRef } from 'react'

interface GameChangerWidgetProps {
  maxGames?: number
  className?: string
}

export function GameChangerWidget({ maxGames = 4, className }: GameChangerWidgetProps) {
  const targetId = useRef(`gc-widget-${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    const id = targetId.current

    function initWidget() {
      const gc = (window as any).GC
      if (gc?.scoreboard) {
        gc.scoreboard.init({
          target: `#${id}`,
          widgetId: "e2cc3143-0338-4eda-a65b-34a2b2db9a97",
          maxVerticalGamesVisible: maxGames,
        })
      }
    }

    if ((window as any).GC) {
      setTimeout(initWidget, 100)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://widgets.gc.com/static/js/sdk.v1.js'
    script.onload = () => setTimeout(initWidget, 1000)
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [maxGames])

  return (
    <div id={targetId.current} className={className}>
      <div className="text-center p-8 text-gray-500">
        Loading schedule from GameChanger...
      </div>
    </div>
  )
}
