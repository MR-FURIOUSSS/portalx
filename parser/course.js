import * as cheerio from "cheerio";

export async function parseCourseDetails(response) {
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

    let batch = "";
    try {
      batch = $("td:contains('Batch:')").next("td").find("font").text().trim();
    } catch {
      batch = "";
    }

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

    return { courseList, batch, status: 200 };
  } catch (error) {
    console.error("Error parsing course details:", error);
    return { error: "Failed to parse course details", status: 500 };
  }
}
