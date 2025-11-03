export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  timestamp: string;
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  code: string;
  message: string;
}
