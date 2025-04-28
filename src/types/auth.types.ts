export interface IUser {
  _id: string;
  createdAt: string;
  email: string;
  histories: string[];
  name: string;
  password: string;
  role: 1 | 2;
  updatedAt: string;
}
