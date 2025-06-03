import { withCaptcha } from "../../fetch/withcaptcha.js";

export async function captchaHandler(c) {
  const { cdigest, password, digest, identifier, captcha } = await c.req.json();
  if (!cdigest || !password || !digest || !identifier || !captcha) {
    return {
      error: "Captcha digest, password, identifier and captcha are required",
      status: 400,
    };
  }

  const fetch = await withCaptcha(
    cdigest,
    password,
    digest,
    identifier,
    captcha
  );
  console.log(fetch);

  if (fetch.error) {
    return { error: fetch.error, status: fetch.status };
  }

  return { data: fetch.data, status: fetch.status };
}
