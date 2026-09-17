import { axiosClient } from "./axiosClient";
import type { Task, TaskInput, TaskStatus } from "../types";

export interface TaskFilters {
  status?: TaskStatus | "";
  search?: string;
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  const { data } = await axiosClient.get<Task[]>("/tasks", { params });
  return data;
}

export async function createTask(payload: TaskInput): Promise<Task> {
  const { data } = await axiosClient.post<Task>("/tasks", payload);
  return data;
}

export async function updateTask(id: number, payload: TaskInput): Promise<Task> {
  const { data } = await axiosClient.put<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await axiosClient.delete(`/tasks/${id}`);
}
