import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { extractErrorMessage } from "./apiError";

function buildAxiosError(data: unknown, status = 400) {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status,
      statusText: "Bad Request",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data,
    }
  );
}

describe("extractErrorMessage", () => {
  it("returns the first validation error when present", () => {
    const error = buildAxiosError({ validationErrors: { email: "Email must be valid" } });
    expect(extractErrorMessage(error)).toBe("Email must be valid");
  });

  it("returns the API message when no validation errors are present", () => {
    const error = buildAxiosError({ message: "Email already in use" }, 409);
    expect(extractErrorMessage(error)).toBe("Email already in use");
  });

  it("returns the fallback message for a non-axios error", () => {
    expect(extractErrorMessage(new Error("boom"), "Something went wrong")).toBe("Something went wrong");
  });

  it("returns the fallback message when the axios error has no response data", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK");
    expect(extractErrorMessage(error, "Network unavailable")).toBe("Network unavailable");
  });
});
