const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://p.raxis.xyz"
    : "http://localhost:3000";

export default baseUrl;
