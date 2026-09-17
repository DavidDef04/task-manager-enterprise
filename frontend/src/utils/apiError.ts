import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

export function extractErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data?.validationErrors) {
      const firstError = Object.values(data.validationErrors)[0];
      if (firstError) return firstError;
    }
    if (data?.message) return data.message;
  }
  return fallback;
}
