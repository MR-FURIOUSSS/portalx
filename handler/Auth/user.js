import { verifyUser } from "../../fetch/login.js";

export async function userHandler(c) {
  let { username } = await c.req.json();
  if (!username) {
    return c.json({ error: "Username is required" }, 400);
  }
  username = username.endsWith("@srmist.edu.in")
    ? username
    : username + "@srmist.edu.in";

  const fetch = await verifyUser(username);
  if (fetch.error) {
    return c.json({ error: fetch.error }, fetch.status);
  }
  return c.json(fetch, fetch.statusCode);
}
