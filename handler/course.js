import { fetchCourseDetails } from "../fetch/course.js";
import { parseCourseDetails } from "../parser/course.js";

export async function courseHandler(c) {
  const cookie = await c.req.header("Token");
  const fetch = await fetchCourseDetails(cookie);
  if (fetch.error) {
    return c.json({ error: fetch.error }, fetch.status);
  }
  const parse = await parseCourseDetails(fetch);
  if (parse.error) {
    return c.json({ error: parse.error }, parse.status);
  }
  return c.json(parse, parse.status);
}
