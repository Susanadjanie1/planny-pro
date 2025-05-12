// lib/api/updateTask.js

export const update = async (taskId, updates, token) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  
    if (!res.ok) {
      throw new Error('Failed to update task');
    }
  
    return res.json();
  };
  