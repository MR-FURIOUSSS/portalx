import { fetchCalendar } from "../fetch/calendar.js";
import { parseCalendar } from "../parser/calendar.js";

export async function calendarHandler(c) {
  const cookie = await c.req.header("Token");
  const fetch = await fetchCalendar(cookie);
  if (fetch.error) {
    return c.json({ error: fetch.error }, fetch.status);
  }
  const parse = await parseCalendar(fetch);
  if (parse.error) {
    return c.json({ error: parse.error }, parse.status);
  }

  return c.json(parse, parse.status);
}
