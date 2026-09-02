import { authenticate, issueToken } from "@/lib/server/auth";
import { error, json, readJson, validationError } from "@/lib/server/http";
import { loginSchema } from "@/lib/schemas";

// PROVIDED IN FULL, and a good example of the shape every route handler in this app follows:
//   1. read the body, 2. validate it with the shared Zod schema, 3. do the work, 4. return JSON.
export async function POST(req: Request) {
  const body = await readJson(req);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const user = authenticate(parsed.data.email, parsed.data.password);
  if (!user) return error(401, "Incorrect email or password");

  return json({ token: issueToken(user.id), user });
}
