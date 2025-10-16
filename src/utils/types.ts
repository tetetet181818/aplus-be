export type JwtPayload = {
  id?: string;
  role: string;
  email: string;
  fullName?: string;
  password?: string;
  university?: string;
};

interface GoogleUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken?: string;
}

export interface GoogleAuthRequest extends Request {
  user: GoogleUserPayload;
}
