import { verifyToken } from "../../utils/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const decoded = verifyToken(token);

      return res
        .status(200)
        .json({ message: "This is a protected route", user: decoded });
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
