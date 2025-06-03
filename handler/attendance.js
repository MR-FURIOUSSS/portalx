import { fetchMarks } from "../fetch/mark.js";
import { parseAttendance } from "../parser/attendance.js";
export async function attendanceHandler(c) {
  const cookie = await c.req.header("Token");
  const fetch = await fetchMarks(cookie);
  if (fetch.error) {
    return c.json({ error: fetch.error }, fetch.status);
  }
  const parse = await parseAttendance(fetch);
  if (parse.error) {
    return c.json({ error: parse.error }, parse.status);
  }
  return c.json(parse, parse.status);
}
