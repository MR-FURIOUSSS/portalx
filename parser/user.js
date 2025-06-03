import * as cheerio from "cheerio";

export async function parseUserInfo(response) {
  try {
    const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
    if (!match || !match[1]) {
      return { error: "Failed to extract user details", status: 500 };
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

    const getText = (selector) => $(selector).text().trim();
    const userInfo = {
      regNumber: getText('td:contains("Registration Number:") + td strong'),
      name: getText('td:contains("Name:") + td strong'),
      mobile: getText('td:contains("Mobile:") + td strong'),
      section: getText('td:contains("Department:") + td strong')
        .split("-")[1]
        .replace("(", "")
        .replace(")", "")
        .replace("Section", "")
        .trim(),
      program: getText('td:contains("Program:") + td strong'),
      department: getText('td:contains("Department:") + td strong')
        .split("-")[0]
        .trim(),

      semester: getText('td:contains("Semester:") + td strong'),
      batch: getText('td:contains("Batch:") + td strong'),
    };

    return { userInfo, status: 200 };
  } catch (error) {
    console.error("Error parsing user info:", error);
    return { error: "Failed to parse user info", status: 500 };
  }
}
