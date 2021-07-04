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
import { redeemedInviteToken } from "../../../utils/clientIndex";
import { mockNextUseRouter } from "../../Shared/__mocks__";

jest.mock("../../../hooks", () => ({
  useCurrentUser: jest.fn(),
  useHasPermissionGlobally: jest.fn(),
  useWindowSize: jest.fn(),
}));

jest.mock("../../../utils/clientIndex", () => ({
  redeemedInviteToken: jest.fn(),
}));

const mockUserName = "mockUserName";
const mockCurrentUser: CurrentUser = {
  id: "1",
  name: mockUserName,
  email: "test@email.com",
  isAuthenticated: true,
  __typename: Common.TypeNames.CurrentUser,
};
const mockInviteToken = "mockInviteToken";

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

  it("should render Header component with groups and log in when user is logged out", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(undefined);
    mocked(useHasPermissionGlobally).mockReturnValue([false]);
    mocked(redeemedInviteToken).mockReturnValueOnce(null);

    const { getByText, container } = await renderHeader();
    const groups = getByText(Messages.navigation.groups());
    const logIn = getByText(Messages.users.actions.logIn());

    await waitFor(() => expect(groups).toBeInTheDocument());
    await waitFor(() => expect(logIn).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it("should render Header component with groups, sign up, and log in when user is logged out and has been invited", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(undefined);
    mocked(useHasPermissionGlobally).mockReturnValue([false]);
    mocked(redeemedInviteToken).mockReturnValueOnce(mockInviteToken);

    const { getByText, container } = await renderHeader();
    const groups = getByText(Messages.navigation.groups());
    const signUp = getByText(Messages.users.actions.signUp());
    const logIn = getByText(Messages.users.actions.logIn());

    await waitFor(() => expect(groups).toBeInTheDocument());
    await waitFor(() => expect(signUp).toBeInTheDocument());
    await waitFor(() => expect(logIn).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it("should render Header component with groups, profile, and log out when user is logged in", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(mockCurrentUser);
    mocked(useHasPermissionGlobally).mockReturnValue([false]);

    const { getByText, container } = await renderHeader();
    const groups = getByText(Messages.navigation.groups());
    const logOut = getByText(Messages.users.actions.logOut());
    const profile = getByText(mockUserName);

    await waitFor(() => expect(groups).toBeInTheDocument());
    await waitFor(() => expect(profile).toBeInTheDocument());
    await waitFor(() => expect(logOut).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it("should render Header component with groups, roles, users, and invites if user has permission", async () => {
    mocked(useHasPermissionGlobally).mockReturnValue([true]);

    const { getByText, container } = await renderHeader();
    const groups = getByText(Messages.navigation.groups());
    const roles = getByText(Messages.navigation.roles());
    const users = getByText(Messages.navigation.users());
    const invites = getByText(Messages.invites.labels.invites());

    await waitFor(() => expect(groups).toBeInTheDocument());
    await waitFor(() => expect(roles).toBeInTheDocument());
    await waitFor(() => expect(users).toBeInTheDocument());
    await waitFor(() => expect(invites).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });
});
