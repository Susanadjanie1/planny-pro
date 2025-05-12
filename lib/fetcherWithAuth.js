export const fetcherWithAuth = async (url) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = new Error('Failed to fetch');
    error.status = res.status;
    throw error;
  }

  const data = await res.json();

  console.log("🔥 RAW TASKS:", data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.tasks)) {
    return data.tasks;
  }

  throw new Error('Invalid task data');
};
