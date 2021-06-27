export const generateRandom = (): string => {
  return Math.random()
    .toString(36)
    .slice(2, 10)
    .split("")
    .map((c) => {
      return Math.random() < 0.5 ? c : c.toUpperCase();
    })
    .join("");
};
