import { fetchUserInfo } from "../fetch/user.js";
import { parseUserInfo } from "../parser/user.js";

export async function userInfoHandler(c) {
  const cookie = await c.req.header("Token");
  const fetch = await fetchUserInfo(cookie);
  if (fetch.error) {
    return c.json({ error: fetch.error }, fetch.status);
  }
  const parse = await parseUserInfo(fetch);
  if (parse.error) {
    return c.json({ error: parse.error }, parse.status);
  }
  return c.json(parse, parse.status);
}
