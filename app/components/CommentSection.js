"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Trash2, Edit, Reply, Smile } from "lucide-react"
import { format } from "date-fns"

export default function CommentSection({ taskId, mutate }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(null)

  const emojiPickerRef = useRef(null)

  // Common emojis
  const commonEmojis = ["👍", "👎", "😊", "😂", "❤️", "🎉", "👏", "🔥"]

  // Get current user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/tasks/${taskId}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setLoading(false)
      }
    }

    if (taskId) {
      fetchComments()
    }
  }, [taskId])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          text: newComment,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update local comments
        setComments((prev) => [...prev, data.comment])
        setNewComment("")

        // Refresh task data to update comment count
        if (mutate) {
          await mutate()
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          text: editText,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update local comments
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId ? { ...comment, text: editText, edited: true, editedAt: new Date() } : comment,
          ),
        )

        setEditingComment(null)
        setEditText("")

        // Refresh task data
        if (mutate) {
          await mutate()
        }
      }
    } catch (error) {
      console.error("Error editing comment:", error)
    }
  }

  const handleReplyToComment = async (parentId) => {
    if (!replyText.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          text: replyText,
          parentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update local comments
        setComments((prev) => [...prev, data.comment])
        setReplyingTo(null)
        setReplyText("")

        // Refresh task data
        if (mutate) {
          await mutate()
        }
      }
    } catch (error) {
      console.error("Error replying to comment:", error)
    }
  }

  const handleAddReaction = async (commentId, emoji) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          emoji,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update local comments with new reactions
        setComments((prev) =>
          prev.map((comment) => (comment._id === commentId ? { ...comment, reactions: data.reactions } : comment)),
        )

        setShowEmojiPicker(null)

        // Refresh task data
        if (mutate) {
          await mutate()
        }
      }
    } catch (error) {
      console.error("Error adding reaction:", error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}?userId=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Update local comments
        setComments((prev) => prev.filter((comment) => comment._id !== commentId))

        // Refresh task data to update comment count
        if (mutate) {
          await mutate()
        }
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const formatCommentDate = (dateString) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm")
    } catch (error) {
      return dateString
    }
  }

  // Get replies for a comment
  const getReplies = (parentId) => {
    return comments.filter((comment) => comment.parentId === parentId)
  }

  // Render a comment with its replies
  const renderComment = (comment, isReply = false) => {
    const replies = getReplies(comment._id)
    const isEditing = editingComment === comment._id
    const isReplying = replyingTo === comment._id
    const isShowingEmojis = showEmojiPicker === comment._id

    return (
      <div
        key={comment._id}
        className={`${isReply ? "ml-6 border-l-2 pl-3 border-gray-200 dark:border-gray-600" : ""}`}
      >
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm mb-2">
          <div className="flex justify-between items-start">
            <div className="font-medium text-gray-700 dark:text-gray-300">
              {comment.userId?.email || comment.userId?.name || "User"}
            </div>

            <div className="flex gap-2">
              {userId && comment.userId?._id === userId && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment._id)
                      setEditText(comment.text)
                    }}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteComment(comment._id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setReplyingTo(comment._id)
                  setReplyText("")
                }}
                className="text-gray-400 hover:text-blue-500"
              >
                <Reply size={14} />
              </button>
              <button
                onClick={() => setShowEmojiPicker((prev) => (prev === comment._id ? null : comment._id))}
                className="text-gray-400 hover:text-yellow-500"
              >
                <Smile size={14} />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setEditingComment(null)}
                  className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditComment(comment._id)}
                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-gray-600 dark:text-gray-300">{comment.text}</p>
          )}

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(
                comment.reactions.reduce((acc, reaction) => {
                  if (!acc[reaction.emoji]) {
                    acc[reaction.emoji] = { count: 0, users: [] }
                  }
                  acc[reaction.emoji].count++
                  acc[reaction.emoji].users.push(reaction.userId)
                  return acc
                }, {}),
              ).map(([emoji, data]) => (
                <button
                  key={emoji}
                  onClick={() => handleAddReaction(comment._id, emoji)}
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    data.users.includes(userId)
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {emoji} {data.count}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {isShowingEmojis && (
            <div
              ref={emojiPickerRef}
              className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-wrap gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(comment._id, emoji)}
                    className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-1 text-xs text-gray-400">
            {formatCommentDate(comment.timestamp)}
            {comment.edited && " (edited)"}
          </div>
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="mb-3 pl-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => handleReplyToComment(comment._id)}
                disabled={!replyText.trim()}
                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-500 mt-1 hover:text-gray-700">
              Cancel
            </button>
          </div>
        )}

        {/* Render replies */}
        {replies.length > 0 && <div className="mt-1 mb-3">{replies.map((reply) => renderComment(reply, true))}</div>}
      </div>
    )
  }

  // Get top-level comments (no parent)
  const topLevelComments = comments.filter((comment) => !comment.parentId)

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comments</h4>

      {loading ? (
        <div className="text-center py-2">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
        </div>
      ) : topLevelComments.length > 0 ? (
        <div className="space-y-3 max-h-60 overflow-y-auto p-1">
          {topLevelComments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">No comments yet</div>
      )}

      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
