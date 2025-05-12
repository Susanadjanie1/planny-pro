// components/MemberTaskUpdate.js

'use client';
import { useState } from 'react';
import { update } from 'lib/api/update';

export default function MemberTaskUpdate({ task }) {
  const [status, setStatus] = useState(task.status || '');
  const [comment, setComment] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await update(task._id, { status, comment }, token);
      alert("Task updated");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <h3 className="font-bold mb-1">Update Task</h3>
      <select value={status} onChange={e => setStatus(e.target.value)} className="mb-2">
        <option value="">Select Status</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <textarea
        placeholder="Add a comment"
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full mb-2"
      />

      <button type="submit" className="btn btn-secondary">Submit</button>
    </form>
  );
}
