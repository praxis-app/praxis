import { render, RenderResult, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { mocked } from "ts-jest/utils";

import Messages from "../../../utils/messages";
import { TypeNames } from "../../../constants/common";
import TopNavDesktop from "../TopNavDesktop";
import { useCurrentUser } from "../../../hooks";
import { redeemedInviteToken } from "../../../utils/clientIndex";
import { mockNextUseRouter } from "../../Shared/__mocks__";

jest.mock("../../../hooks", () => ({
  useCurrentUser: jest.fn(),
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
  __typename: TypeNames.CurrentUser,
};
const mockInviteToken = "mockInviteToken";

const renderTopNavDesktop = async (): Promise<RenderResult> => {
  mockNextUseRouter("/");
  return render(
    <MockedProvider>
      <TopNavDesktop />
    </MockedProvider>
  );
};

describe("Top Navigation for Desktop", () => {
  it.skip("should render TopNavDesktop component with log in when user is logged out", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(undefined);
    mocked(redeemedInviteToken).mockReturnValueOnce(null);

    const { getByText, container } = await renderTopNavDesktop();
    const logIn = getByText(Messages.users.actions.logIn());

    await waitFor(() => expect(logIn).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it.skip("should render TopNavDesktop component with sign up and log in when user is logged out and has been invited", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(undefined);
    mocked(redeemedInviteToken).mockReturnValueOnce(mockInviteToken);

    const { getByText, container } = await renderTopNavDesktop();
    const signUp = getByText(Messages.users.actions.signUp());
    const logIn = getByText(Messages.users.actions.logIn());

    await waitFor(() => expect(signUp).toBeInTheDocument());
    await waitFor(() => expect(logIn).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });

  it.skip("should render TopNavDesktop component with profile and log out when user is logged in", async () => {
    mocked(useCurrentUser).mockReturnValueOnce(mockCurrentUser);

    const { getByText, container } = await renderTopNavDesktop();
    const logOut = getByText(Messages.users.actions.logOut());
    const profile = getByText(mockUserName);

    await waitFor(() => expect(profile).toBeInTheDocument());
    await waitFor(() => expect(logOut).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });
});
