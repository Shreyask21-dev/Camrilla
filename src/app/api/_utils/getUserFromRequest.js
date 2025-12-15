import jwt from "jsonwebtoken";

export function getUserFromRequest(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Contains fields like id, email, name, etc.
  } catch (err) {
    console.error("JWT Auth Error:", err.message);
    return null;
  }
}
