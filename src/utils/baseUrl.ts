import { Environments } from "../constants/common";
import getConfig from "next/config";

const {
  publicRuntimeConfig: { PRODUCTION_BASE_URL },
} = getConfig();

export const baseUrl =
  process.env.NODE_ENV === Environments.Production
    ? (PRODUCTION_BASE_URL as string)
    : "http://localhost:3000";
