import axios from "axios";

export async function verifyUser(username) {
  try {
    const data = await axios(
      `https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/lookup/${username}`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "sec-ch-ua":
            '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-zcsrf-token": "iamcsrcoo=3dea6395-0540-44ea-8de7-544256dd7549",
          cookie:
            "zalb_74c3a1eecc=50830239914cba1225506e915a665a91; zccpn=68703e7d-ccf0-42ba-92b2-9c87c7a0c8ae; JSESSIONID=739937C3826C1F58C37186170B4F4B36; cli_rgn=IN; _ga=GA1.3.1846200817.1748679237; _gid=GA1.3.734795940.1748679237; _gat=1; _ga_HQWPLLNMKY=GS2.3.s1748679237$o1$g0$t1748679237$j60$l0$h0; zalb_f0e8db9d3d=983d6a65b2f29022f18db52385bfc639; iamcsr=3dea6395-0540-44ea-8de7-544256dd7549; _zcsr_tmp=3dea6395-0540-44ea-8de7-544256dd7549; stk=4ec13d42454007681bd4337cf126baec",
          Referer:
            "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&servicename=ZohoCreator&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: "mode=primary&cli_time=1748679238492&servicename=ZohoCreator&service_language=en&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin",
        method: "POST",
      }
    );
    const response = data.data;
    return {
      identity: response.lookup?.identifier,
      statusCode: response.status_code,
      message: response.message,
      digest: response.lookup?.digest,
    };
  } catch (error) {
    console.error("Error verifying user:", error);
    return { error: "Failed to verify user" };
  }
}

export async function verifyPassword(digest, identifier, password) {
  try {
    const data = await fetch(
      `https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/primary/${identifier}/password?digest=${digest}&cli_time=${Date.now()}&servicename=ZohoCreator&service_language=en&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-zcsrf-token": "iamcsrcoo=fae2d8fa-e5a1-4cb0-a5ee-cc40af87e89f",
          cookie:
            "zalb_74c3a1eecc=4cad43ac9848cc7edd20d2313fcde774; zccpn=a6fa7bc8-11c7-44ad-8be8-0aa6b04fad8a; JSESSIONID=3BD0053672AF3D628D983A15AA469D07; cli_rgn=IN; _ga=GA1.3.2061081340.1748689001; _gid=GA1.3.1677956689.1748689001; _ga_HQWPLLNMKY=GS2.3.s1748689001$o1$g0$t1748689001$j60$l0$h0; zalb_f0e8db9d3d=7ad3232c36fdd9cc324fb86c2c0a58ad; iamcsr=fae2d8fa-e5a1-4cb0-a5ee-cc40af87e89f; _zcsr_tmp=fae2d8fa-e5a1-4cb0-a5ee-cc40af87e89f; stk=d6559e9a58e77dbea9e24adf3bb57941",
          Referer:
            "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&servicename=ZohoCreator&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: `{"passwordauth":{"password":"${password}"}}`,
        method: "POST",
      }
    );

    const response = await data.json();

    if (response.status_code === 201) {
      const cookies = await data.headers
        .getSetCookie()
        .filter((cookie) => !cookie.includes("Max-Age=0"))
        .join("; ");
      return {
        isAuthenticated: true,
        cookies,
      };
    }

    const captchaRequired = response.localized_message
      ?.toLowerCase()
      ?.includes("captcha")
      ? true
      : false;

    return {
      isAuthenticated: false,
      statusCode: response.status_code,
      message: response.localized_message,
      captcha: captchaRequired
        ? { required: true, digest: response.cdigest }
        : { required: false, digest: null },
    };
  } catch (error) {
    console.error("Error verifying password:", error);
    return { error: "Failed to verify password" };
  }
}

export async function verifyCaptcha(c) {
  const { digest } = await c.req.json();
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
          cookie:
            "zalb_f0e8db9d3d=7ad3232c36fdd9cc324fb86c2c0a58ad; zalb_74c3a1eecc=6cbd0b62d3c0163d8972287f74766e80; stk=347a8aaf4ebb7a8a991d61124d72f069; CT_CSRF_TOKEN=84c3d1ef-8a61-4d4e-8573-4b78d888bd86; zccpn=f566daf42872f32dd4a9530e76c85cad7fb804d9ef2b63764aa3793f2dee9b9959c41d52adde55fbf8d39ac5917c3aa5e09e80f21538c6bbe677ebb8b11e4534; _zcsr_tmp=f566daf42872f32dd4a9530e76c85cad7fb804d9ef2b63764aa3793f2dee9b9959c41d52adde55fbf8d39ac5917c3aa5e09e80f21538c6bbe677ebb8b11e4534; npfwg=1; npf_r=https://www.google.com/; npf_l=www.srmist.edu.in; npf_u=https://www.srmist.edu.in/faculty/mrs-s-nagadevi/; npf_fx=1; zalb_3309580ed5=5e41c4a69d62a20d11fee6ef8532db03; iamcsr=f566daf42872f32dd4a9530e76c85cad7fb804d9ef2b63764aa3793f2dee9b9959c41d52adde55fbf8d39ac5917c3aa5e09e80f21538c6bbe677ebb8b11e4534; _gcl_au=1.1.1671425141.1748076707; _fbp=fb.2.1748076707392.149271661977679579; _uetvid=537ab790387c11f08d76e94643322aeb; _ga_S234BK01XY=GS2.3.s1748076707$o1$g0$t1748076707$j60$l0$h0$dmvBxb7c2cO29-w-2U08eGmPDc0g-73h5GA; TS014f04d9=0190f757c9728507318e3f9d0cf05e594a977c7c8df6765fdf71ca3cffb03d83fd80d89dd958303e4e841b8eb99c25a77ef7af3ca9; _ga_QNCRQG0GFE=GS2.1.s1748364521$o8$g0$t1748364521$j60$l0$h0$dK3_LTeadnCbM7cu4UBbIIKy7ZRkOLghz0A; cli_rgn=IN; _ga=GA1.3.367576134.1747940161; _gid=GA1.3.1912743378.1748502411; JSESSIONID=E65BFAE25942D38B286A015B81D79A15; _gat=1; _ga_HQWPLLNMKY=GS2.3.s1748511917$o4$g0$t1748511917$j60$l0$h0",
        },
        body: null,
        method: "GET",
      }
    );
    const response = await data.json();
    let image = response.captcha.image_bytes;
    return c.json({
      image: image !== null ? image : null,
    });
  } catch (error) {
    console.error("Error verifying captcha:", error);
    return c.json({ error: "Failed to verify captcha" }, 500);
  }
}
