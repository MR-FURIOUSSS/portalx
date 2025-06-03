import { supabase } from "../../lib/supabase.js"

export async function logoutHandler(c) {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "") || c.req.header("Token")

    if (!token) {
      return c.json({ error: "Token required" }, 400)
    }

    // Clear the token from database
    const { error } = await supabase
      .from("users")
      .update({
        session_token: null,
        token_expires_at: null,
      })
      .eq("session_token", token)

    if (error) {
      console.error("Logout error:", error)
      return c.json({ error: "Failed to logout" }, 500)
    }

    return c.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
}
