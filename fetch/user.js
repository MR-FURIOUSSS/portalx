import axios from "axios";

export async function fetchUserInfo(cookie) {
  try {
    const request = await axios(
      "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          cookie,
          Referer: "https://academia.srmist.edu.in/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: null,
        method: "GET",
      }
    );

    return request.data;
  } catch (error) {
    if (error.status === 500) {
      return { error: "Unauthorized", status: 401 };
    }

    return {
      error: error.message || "Failed to fetch user info",
      status: error.status,
    };
  }
}
