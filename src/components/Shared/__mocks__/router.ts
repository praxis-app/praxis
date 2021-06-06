export const useRouter = jest.spyOn(require("next/router"), "useRouter");

export const mockNextUseRouter = (pathname: string) => {
  useRouter.mockImplementation(() => ({
    pathname,
    query: {},
    asPath: "",
    push: async () => true,
    prefetch: async () => undefined,
  }));
};
