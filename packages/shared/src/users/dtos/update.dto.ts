export interface UpdateParams {
  id: string;
}

export interface UpdateBody {
  name?: string;
  surname?: string;
  password?: string;
  currentPassword?: string;
}
