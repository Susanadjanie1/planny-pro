"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, MessageSquare, Edit2, Trash2 } from "lucide-react"
import { Avatar , AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/buttons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { CommentForm } from "./CommentForm"
import { ReactionPicker } from "./ReactionPicker"

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  replyingTo,
  onSubmitReply,
  currentUserId,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.text)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(comment.text)
  }

  const handleSaveEdit = () => {
    onEdit(comment._id, editContent)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleAddReaction = (emoji) => {
    onReaction(comment._id, emoji)
    setShowReactionPicker(false)
  }

  const formattedTime = comment.timestamp ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true }) : ""

  // Check if current user is the author of the comment
  const isAuthor = currentUserId && comment.userId && currentUserId === comment.userId._id

  // Get author name or email
  const authorName = comment.userId?.name || comment.userId?.email || comment.user?.email || "Anonymous"

  return (
    <div className="group">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={"/placeholder.svg?height=40&width=40"} alt={authorName} />
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{authorName}</span>
              <span className="text-sm text-muted-foreground">{formattedTime}</span>
              {comment.edited && <span className="text-xs text-muted-foreground">(edited)</span>}
            </div>

            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(comment._id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm">{comment.text}</div>
          )}

          {/* Reactions */}
          <div className="flex flex-wrap gap-2 mt-2">
            {comment.reactions &&
              Object.values(
                (comment.reactions || []).reduce((acc, reaction) => {
                  const key = reaction.emoji
                  if (!acc[key]) {
                    acc[key] = {
                      emoji: key,
                      count: 0,
                      users: [],
                    }
                  }
                  acc[key].count++
                  if (reaction.userId) {
                    acc[key].users.push(
                      typeof reaction.userId === "object" ? reaction.userId._id : reaction.userId.toString(),
                    )
                  }
                  return acc
                }, {}),
              ).map((reaction, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-sm"
                  onClick={() => onReaction(comment._id, reaction.emoji)}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              ))}

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setShowReactionPicker(!showReactionPicker)}
              >
                +
              </Button>

              {showReactionPicker && (
                <ReactionPicker onSelectReaction={handleAddReaction} onClose={() => setShowReactionPicker(false)} />
              )}
            </div>
          </div>

          {/* Reply button */}
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-sm" onClick={() => onReply(comment._id)}>
              <MessageSquare className="mr-1 h-4 w-4" />
              Reply
            </Button>
          </div>

          {/* Reply form */}
          {replyingTo === comment._id && (
            <div className="mt-4">
              <CommentForm
                onSubmit={(content) => onSubmitReply(comment._id, content)}
                onCancel={() => onReply("")}
                placeholder="Write a reply..."
                submitLabel="Reply"
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-muted">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReaction={onReaction}
                  replyingTo={replyingTo}
                  onSubmitReply={onSubmitReply}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
