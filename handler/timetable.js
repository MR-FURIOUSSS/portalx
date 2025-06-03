import { fetchCourseDetails } from "../fetch/course.js";
import { parseTimetable } from "../parser/timetable.js";

export async function timetableHandler(c) {
  const cookie = await c.req.header("Token");
  const fetch = await fetchCourseDetails(cookie);
  if (fetch.error) {
    return c.json({ error: fetch.error }, fetch.status);
  }
  const parse = await parseTimetable(fetch);
  if (parse.error) {
    return c.json({ error: parse.error }, parse.status);
  }
  return c.json(parse, parse.status);
}
