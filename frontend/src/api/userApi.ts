import { axiosClient } from "./axiosClient";
import type { ChangePasswordPayload, UpdateProfilePayload, UserProfile } from "../types";

export async function fetchCurrentUser(): Promise<UserProfile> {
  const { data } = await axiosClient.get<UserProfile>("/users/me");
  return data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const { data } = await axiosClient.put<UserProfile>("/users/me", payload);
  return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await axiosClient.put("/users/me/password", payload);
}
