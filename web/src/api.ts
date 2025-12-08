import { Resource, LoginResponse } from './types'

const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function getResources(): Promise<Resource[]> {
  return request<Resource[]>('/resources')
}

export async function createResource(data: {
  name: string
  group: string
  expire_at: number // Unix 时间戳
}): Promise<Resource> {
  return request<Resource>('/resources', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function renewResource(
  id: number,
  data: { days?: number; expire_at?: number } // expire_at 为 Unix 时间戳
): Promise<Resource> {
  return request<Resource>(`/resources/${id}/renew`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function updateResource(
  id: number,
  data: { name?: string; group?: string; expire_at?: number }
): Promise<Resource> {
  return request<Resource>(`/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteResource(id: number): Promise<void> {
  await request(`/resources/${id}`, { method: 'DELETE' })
}

export async function getGroups(): Promise<string[]> {
  return request<string[]>('/groups')
}

export interface BackupData {
  version: string
  export_at: number
  resources: {
    name: string
    group: string
    expire_at: number
    created_at: number
  }[]
}

export async function exportBackup(): Promise<BackupData> {
  return request<BackupData>('/backup')
}

export interface RestoreResult {
  message: string
  imported: number
  mode: string
}

export async function restoreBackup(
  data: BackupData,
  mode: 'overwrite' | 'append'
): Promise<RestoreResult> {
  return request<RestoreResult>('/backup/restore', {
    method: 'POST',
    body: JSON.stringify({ mode, data }),
  })
}
