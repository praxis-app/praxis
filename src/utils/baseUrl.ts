import { Common } from "../constants";

const baseUrl =
  process.env.NODE_ENV === Common.Environments.Production
    ? "https://p.raxis.xyz"
    : "http://localhost:3000";

export default baseUrl;
