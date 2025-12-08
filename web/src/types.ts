export interface Resource {
  id: number
  name: string
  group: string
  expire_at: number  // Unix 时间戳
  created_at: number // Unix 时间戳
  remaining_days: number
}

export interface LoginResponse {
  token: string
  username: string
}
