import { Environments } from "../constants/common";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export const baseUrl =
  publicRuntimeConfig &&
  publicRuntimeConfig.NODE_ENV === Environments.Production
    ? (publicRuntimeConfig.PRODUCTION_BASE_URL as string)
    : "http://localhost:3000";
