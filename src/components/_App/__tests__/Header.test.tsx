import { render, RenderResult, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { mocked } from "ts-jest/utils";

import Messages from "../../../utils/messages";
import { Common } from "../../../constants";
import Header from "../Header";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useWindowSize,
} from "../../../hooks";
import { mockNextUseRouter } from "../../Shared/__mocks__";

jest.mock("../../../hooks", () => ({
  useCurrentUser: jest.fn(),
  useHasPermissionGlobally: jest.fn(),
  useWindowSize: jest.fn(),
}));

const testName = "testName";
const mockCurrentUser: CurrentUser = {
  id: "1",
  name: testName,
  email: "test@email.com",
  isAuthenticated: true,
  __typename: Common.TypeNames.CurrentUser,
};

const renderHeader = async (): Promise<RenderResult> => {
  mockNextUseRouter("/");
  return render(
    <MockedProvider>
      <Header />
    </MockedProvider>
  );
};

describe("Header", () => {
  beforeAll(() => {
    mocked(useWindowSize).mockReturnValueOnce([]);
  });

  it("should render Header component with sign up and log in when user is logged out", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(undefined);
    mocked(useHasPermissionGlobally).mockReturnValue([false]);

    const { getByText, container } = await renderHeader();
    const signUp = getByText(Messages.users.actions.signUp());
    const logIn = getByText(Messages.users.actions.logIn());

    await waitFor(() => expect(signUp).toBeInTheDocument());
    await waitFor(() => expect(logIn).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it("should render Header component with profile and log out when user is logged in", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(mockCurrentUser);
    mocked(useHasPermissionGlobally).mockReturnValue([false]);

    const { getByText, container } = await renderHeader();
    const logOut = getByText(Messages.users.actions.logOut());
    const profile = getByText(testName);

    await waitFor(() => expect(profile).toBeInTheDocument());
    await waitFor(() => expect(logOut).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it("should render Header component with roles and users if user has permission", async () => {
    mocked(useHasPermissionGlobally).mockReturnValue([true]);

    const { getByText, container } = await renderHeader();
    const roles = getByText(Messages.navigation.roles());
    const users = getByText(Messages.navigation.users());

    await waitFor(() => expect(roles).toBeInTheDocument());
    await waitFor(() => expect(users).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });
});
