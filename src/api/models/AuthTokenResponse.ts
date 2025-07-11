/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthTokenResponse = {
  access: string;
  refresh: string;
  role: string;
  user_id: number;
  provider_id: number | null;
  person_id: number | null;
  /**
   * Full name of the user.
   */
  full_name: string;
  /**
   * Email address of the user.
   */
  email: string;
  social_name: string;
  /**
   * URL of the user's profile picture.
   */
  profile_picture: string | null;
  /**
   * Indicates if the user prefers dark mode.
   */
  use_dark_mode?: boolean;
};
