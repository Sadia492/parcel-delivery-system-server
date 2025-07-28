export enum Role {
  SENDER = "SENDER",
  ADMIN = "ADMIN",
  RECEIVER = "RECEIVER",
  USER = "USER",
}

export enum IsBlocked {
  UNBLOCKED = "UNBLOCKED",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  isBlocked?: IsBlocked;
  role: Role;
}
