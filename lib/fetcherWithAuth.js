export const fetcherWithAuth = async (url) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = new Error("Failed to fetch")
    error.status = res.status
    throw error
  }

  const data = await res.json()

  // For debugging
  console.log("🔥 RAW TASKS:", data)

  // Handle different response formats
  if (Array.isArray(data)) {
    return data
  }

  // If data is an object with a tasks array property
  if (data && data.tasks && Array.isArray(data.tasks)) {
    return data.tasks
  }

  // If data is an object with a projects array property
  if (data && data.projects && Array.isArray(data.projects)) {
    return data.projects
  }

  // If it's a single object (like a task or project detail)
  if (data && typeof data === "object") {
    return data
  }

  // If we get here, the data format is unexpected
  throw new Error("Invalid data format")
}
