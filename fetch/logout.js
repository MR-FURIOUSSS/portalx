import axios from "axios";

export async function fetchLogout(cookie) {
  try {
    const response = await axios(
      "https://academia.srmist.edu.in/accounts/p/10002227248/logout?servicename=ZohoCreator&serviceurl=https://academia.srmist.edu.in",
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/x-www-form-urlencoded",
          cookie,
        },
      }
    );

    return response.data;
  } catch (error) {
    return { error: "logout successful", status: 200 };
  }
}
