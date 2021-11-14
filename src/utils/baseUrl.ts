import { Environments } from "../constants/common";

export const baseUrl =
  process.env.NODE_ENV === Environments.Production
    ? (process.env.PRODUCTION_BASE_URL as string)
    : "http://localhost:3000";
