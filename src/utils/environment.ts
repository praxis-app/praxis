import { Common } from "../constants";

export const inDev = (): boolean => {
  return process.env.NODE_ENV === Common.Environments.Development;
};

export const inProd = (): boolean => {
  return process.env.NODE_ENV === Common.Environments.Production;
};
