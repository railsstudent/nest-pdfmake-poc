export interface User {
  id: number
  name: string
  email: string
  language: string
}

export interface DbSchema {
  users: User[]
}
