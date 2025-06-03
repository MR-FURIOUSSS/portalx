import { verifyPassword } from "../../fetch/login.js";
import { getCaptcha } from "../../utils/getCaptcha.js";

export async function passwordHandler(c) {
  const { digest, identifier, password } = await c.req.json();
  if (!digest || !identifier || !password) {
    return c.json(
      { error: "Digest, identifier and password are required" },
      400
    );
  }
  const fetch = await verifyPassword(digest, identifier, password);
  if (fetch?.error) {
    return c.json({ error: fetch.error }, fetch.status);
  }
  if (!fetch.isAuthenticated && fetch.captcha.required) {
    const captcha = await getCaptcha(fetch.captcha.digest);
    if (captcha.error) {
      return c.json({ error: captcha.error }, 500);
    }
    return c.json(
      {
        isAuthenticated: false,
        statusCode: fetch.statusCode,
        message: fetch.message,
        captcha: {
          required: true,
          digest: fetch.captcha.digest,
          image: captcha.image_bytes,
        },
      },
      fetch.statusCode
    );
  }
  return c.json(fetch, fetch.statusCode);
}
