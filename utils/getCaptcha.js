export async function getCaptcha(digest) {
  try {
    const data = await fetch(
      `https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/captcha/${digest}?darkmode=false`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
      }
    );
    const response = await data.json();
    return response.captcha;
  } catch (error) {
    console.error("Error verifying captcha:", error);
    return { error: "Failed to verify captcha" };
  }
}
