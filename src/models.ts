export interface Signup {
  name: string
  email: string
  password: string
}

export interface Signin {
  email: string
  password: string
}

export interface Account {
  id: number,
  name: string,
  email: string,
  password: string,
  salt: string,
}