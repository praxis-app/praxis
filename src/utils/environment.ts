import { Environments } from "../constants/common";

export const inDev = (): boolean => {
  return process.env.NODE_ENV === Environments.Development;
};

export const inProd = (): boolean => {
  return process.env.NODE_ENV === Environments.Production;
};
