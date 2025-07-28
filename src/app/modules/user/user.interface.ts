export enum Role {
  ADMIN = "ADMIN",
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
}

export enum IsBlocked {
  UNBLOCKED = "UNBLOCKED",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  isBlocked?: IsBlocked;
  role: Role;
}
