"use client"
import { useEffect, useState } from "react"
import { CommentForm } from "./CommentForm"
import { CommentItem } from "./CommentItems"

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([])
  const [replyingTo, setReplyingTo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    // Get current user ID from cookies
    const getCookie = (name) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(";").shift()
      return null
    }

    const userId = getCookie("userId")
    setCurrentUserId(userId)

    fetchComments()
  }, [taskId])

  async function fetchComments() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`)

      if (!res.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await res.json()

      // Transform the flat comments array into a threaded structure
      const commentMap = new Map()
      const rootComments = []

      // First pass: create a map of all comments
      data.comments.forEach((comment) => {
        commentMap.set(comment._id, {
          ...comment,
          replies: [],
        })
      })

      // Second pass: build the tree structure
      commentMap.forEach((comment) => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId)
          if (parent) {
            parent.replies.push(comment)
          } else {
            rootComments.push(comment)
          }
        } else {
          rootComments.push(comment)
        }
      })

      setComments(rootComments)
    } catch (err) {
      console.error("Error fetching comments:", err)
      setError("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }

  async function addComment(content) {
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
        return null
      }

      const userId = getCookie("userId")
      const email = getCookie("email")

      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          userId: userId,
          email: email,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to add comment")
      }

      // Refresh comments after adding
      fetchComments()
    } catch (err) {
      console.error("Error adding comment:", err)
      setError("Failed to add comment")
    }
  }

  async function addReply(parentId, content) {
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
        return null
      }

      const userId = getCookie("userId")
      const email = getCookie("email")

      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          parentId: parentId,
          userId: userId,
          email: email,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to add reply")
      }

      // Refresh comments after adding reply
      fetchComments()
      setReplyingTo(null)
    } catch (err) {
      console.error("Error adding reply:", err)
      setError("Failed to add reply")
    }
  }

  async function editComment(commentId, newContent) {
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
        return null
      }

      const userId = getCookie("userId")

      const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newContent,
          userId: userId,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update comment")
      }

      // Refresh comments after editing
      fetchComments()
    } catch (err) {
      console.error("Error updating comment:", err)
      setError("Failed to update comment")
    }
  }

  async function deleteComment(commentId) {
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
        return null
      }

      const userId = getCookie("userId")

      const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}?userId=${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete comment")
      }

      // Refresh comments after deleting
      fetchComments()
    } catch (err) {
      console.error("Error deleting comment:", err)
      setError("Failed to delete comment")
    }
  }

  async function toggleReaction(commentId, emoji) {
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
        return null
      }

      const userId = getCookie("userId")

      const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emoji,
          userId: userId,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to toggle reaction")
      }

      // Refresh comments after toggling reaction
      fetchComments()
    } catch (err) {
      console.error("Error toggling reaction:", err)
      setError("Failed to toggle reaction")
    }
  }

  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground">Loading comments...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No comments yet</div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={(id) => setReplyingTo(id)}
              onEdit={editComment}
              onDelete={deleteComment}
              onReaction={toggleReaction}
              replyingTo={replyingTo}
              onSubmitReply={addReply}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      <div className="mt-8 pt-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Add a comment</h2>
        <CommentForm onSubmit={addComment} />
      </div>
    </div>
  )
}
