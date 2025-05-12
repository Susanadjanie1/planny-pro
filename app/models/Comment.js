import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emoji: String
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  reactions: [ReactionSchema],
  edited: { type: Boolean, default: false },
  editedAt: Date
}, {
  timestamps: true
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
