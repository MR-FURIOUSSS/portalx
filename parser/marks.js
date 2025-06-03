import * as cheerio from "cheerio";

export async function parseMarks(response) {
  try {
    const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
    if (!match || !match[1]) {
      console.error("Failed to extract sanitized content from response");
      return { error: "Failed to extract marks data", status: 500 };
    }
    let encodedHtml = match[1];
    let decodedHtml = encodedHtml
      .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/\\\\/g, "")
      .replace(/\\'/g, "'");
    const $ = cheerio.load(decodedHtml);

    const table = $("table:nth-child(7)");
    const marksDetails = [];
    const tableRows = table.find("tr");
    tableRows.each((i, row) => {
      if (i === 0) return;
      const cols = $(row).find("td");
      const course = $(cols[0]).text().trim();
      const category = $(cols[1]).text().trim();

      const marksTable = $(cols[2]).find("table");
      if (course === "" || category === "" || marksTable.length === 0) return;
      const marks = [];
      let total = { obtained: 0, maxMark: 0 };
      marksTable.find("td").each((j, markTd) => {
        const strongText = $(markTd).find("strong").text().trim();
        const [type, max] = strongText.split("/");
        const obtained = $(markTd)
          .text()
          .replace(strongText, "")
          .trim()
          .replace(/^\n+|\n+$/g, "");
        if (type && max) {
          marks.push({
            exam: type.trim(),
            obtained: obtained,
            maxMark: max.trim(),
          });
        }

        const obtainedMarks = parseFloat(obtained);
        if (!isNaN(obtainedMarks)) {
          total.obtained += obtainedMarks;
        }
        const maxMarks = parseFloat(max);
        if (!isNaN(maxMarks)) {
          total.maxMark += maxMarks;
        }
      });

      total.obtained = Number(total.obtained.toFixed(2));
      total.maxMark = Number(total.maxMark.toFixed(2));
      marksDetails.push({ course, category, marks, total });
    });

    return { markList: marksDetails, status: 200 };
  } catch (error) {
    console.error("Error parsing marks:", error);
    return { error: "Failed to parse marks", status: 500 };
  }
}
