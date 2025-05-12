"use client"

import { useState } from "react"
import { Button } from "./ui/buttons"
import { Textarea } from "./ui/textarea"

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  submitLabel = "Submit",
  initialValue = "",
}) {
  const [content, setContent] = useState(initialValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content)
      setContent("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!content.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

