import { batchSlots } from "../utils/data.js";
import * as cheerio from "cheerio";
export async function parseTimetable(response) {
  try {
    const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
    if (!match || !match[1]) {
      return { error: "Failed to extract course details", status: 500 };
    }

    let encodedHtml = match[1];

    let decodedHtml = encodedHtml
      .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/\\\\/g, "")
      .replace(/\\'/g, "'");

    const $ = cheerio.load(decodedHtml, {
      decodeEntities: true,
      lowerCaseTags: true,
      xmlMode: false,
    });

    const batch = $("td:contains('Batch:')")
      .next("td")
      .find("font")
      .text()
      .trim();

    const courseList = Array.from($(".course_tbl tr").slice(1)).map((row) => {
      const columns = $(row).find("td");
      const get = (idx) => (columns[idx] ? $(columns[idx]).text().trim() : "");
      const slotRaw = get(8);
      const sortedSlot = slotRaw
        ? slotRaw
            .split("-")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      return {
        courseCode: get(1),
        courseTitle: get(2),
        courseCredit: get(3),
        courseCategory: get(4),
        courseType: get(5),
        courseFaculty: get(7),
        courseSlot: sortedSlot,
        courseRoomNo: get(9),
      };
    });
    let batchData = batchSlots[batch];

    const slotMap = {};
    courseList.forEach((course) => {
      course.courseSlot.forEach((slot) => {
        if (slot) {
          slotMap[slot] = {
            courseTitle: course.courseTitle,
            courseCode: course.courseCode,
            courseCategory: course.courseCategory,
            courseRoomNo: course.courseRoomNo,
          };
        }
      });
    });

    const timetable = batchData.slots.map((day) => ({
      dayOrder: day.dayOrder,
      class: day.slots.map((slot, i) => {
        const slotInfo = slotMap[slot]
          ? {
              slot,
              isClass: true,
              courseTitle: slotMap[slot].courseTitle,
              courseCode: slotMap[slot].courseCode,
              courseCategory: slotMap[slot].courseCategory,
              courseRoomNo: slotMap[slot].courseRoomNo,
            }
          : { slot, isClass: false };
        return {
          ...slotInfo,
          time: day.time[i],
        };
      }),
    }));

    return { timetable, status: 200 };
  } catch (error) {
    console.error("Error parsing timetable:", error);
    return { error: "Failed to parse timetable", status: 500 };
  }
}
