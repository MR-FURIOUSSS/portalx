import * as cheerio from "cheerio";
export async function parseAttendance(response) {
  const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
  if (!match || !match[1]) {
    return { error: "Failed to extract attendance data", status: 500 };
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
  const table = $('table[style*="font-size :16px;"][bgcolor="#FAFAD2"]');

  const rows = table.find("tr").slice(1).toArray();
  const attendanceDetails = rows.map((row) => {
    const cols = $(row).find("td");
    const get = (idx) => (cols[idx] ? $(cols[idx]).text().trim() : "");
    return {
      courseCode: cols[0] ? $(cols[0]).contents().first().text().trim() : "",
      courseType: cols[0] ? $(cols[0]).find("font").text().trim() : "",
      courseTitle: get(1),
      courseCategory: get(2),
      courseFaculty: get(3).split("(")[0].trim(),
      courseSlot: get(4),
      courseAttendance: cols[5] ? $(cols[5]).find("strong").text().trim() : "",
    };
  });

  return { attendance: attendanceDetails, status: 200 };
}
