"use client"

import { useEffect, useRef } from "react"
import { Button } from "./ui/buttons"

export function ReactionPicker({ onSelectReaction, onClose }) {
  const pickerRef = useRef(null)

  // Common emoji reactions
  const commonEmojis = ["👍", "👎", "❤️", "😄", "😢", "😮", "🎉", "🤔", "👏", "🔥"]

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 p-2 bg-background border rounded-lg shadow-lg z-10 flex flex-wrap gap-1 max-w-[200px]"
    >
      {commonEmojis.map((emoji) => (
        <Button key={emoji} variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onSelectReaction(emoji)}>
          {emoji}
        </Button>
      ))}
    </div>
  )
}
