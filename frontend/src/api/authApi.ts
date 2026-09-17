import { axiosClient } from "./axiosClient";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types";

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await axiosClient.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await axiosClient.post<AuthResponse>("/auth/login", payload);
  return data;
}
