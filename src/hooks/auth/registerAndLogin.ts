import { ApiError } from "../../types.ts";

export async function registerAndLogin<T>(
  register: () => Promise<unknown>,
  login: () => Promise<T>,
): Promise<T> {
  try {
    await register();
  } catch (error) {
    // A registered project can still obtain a fresh session using the signed data.
    if (!(error instanceof ApiError) || error.statusCode !== 409) throw error;
  }
  return login();
}
