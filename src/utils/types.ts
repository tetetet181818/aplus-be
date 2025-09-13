export type JwtPayload = {
  id: string;
  role: string;
  email: string;
};

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  university?: string;
}

/**
 * Forget password payload inside reset token.
 */
export interface ResetPasswordPayload {
  email: string;
}
