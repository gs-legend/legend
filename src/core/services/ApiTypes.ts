export type Id = string;

export type User = string;

export type Token = string;

export type AuthResponse = {
  token: string;
  userValid: boolean;
  username: string;
};

export type LoginPayload = {
  authServerHost: string;
  userDomain: string;
  username: string;
  password: string;
};

export type ForgottenPasswordPayload = {
  email: string;
};

export type GetDomainResponse = {
  domain: string;
}

export type GetLogoResponse = {
  logodata: string;
}

export type GetUserResponse = {
  fullName: string;
  userId: string;
  userdomain: string;
}

export type GetMenuResponse = {
  name: string;
  icon?: any;
}
