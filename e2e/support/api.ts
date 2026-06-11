import { type APIRequestContext } from "@playwright/test";

export async function getDevConfirmationCode(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  const res = await request.get(
    `http://localhost:3001/api/dev/confirmation-code?email=${encodeURIComponent(email)}`,
  );
  const body = (await res.json()) as { code: string | null };
  if (!body.code)
    throw new Error(
      `No dev confirmation code for ${email} — is the API running in dev mode?`,
    );
  return body.code;
}
