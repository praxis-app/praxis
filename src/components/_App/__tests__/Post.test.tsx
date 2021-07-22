import { render, RenderResult, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { mocked } from "ts-jest/utils";
import { Common } from "../../../constants";
import Post from "../../Posts/Post";
import {
  useUserById,
  useHasPermissionGlobally,
  useWindowSize,
} from "../../../hooks";
import { mockNextUseRouter } from "../../Shared/__mocks__";
import deletePostHandler from "../../../pages/posts/[id]";

jest.mock("../../../hooks", () => ({
  useCurrentUser: jest.fn(),
  useUserById: jest.fn(),
  useHasPermissionGlobally: jest.fn(),
  useWindowSize: jest.fn(),
}));

jest.mock("../../../utils/clientIndex", () => ({
  redeemedInviteToken: jest.fn(),
}));

jest.mock("../../../utils/time", () => ({
  timeAgo: jest.fn(),
}));

const mockUserName = "mockUserName";
const mockUser: User = {
  id: "1",
  name: mockUserName,
  email: "test@email.com",
  createdAt: new Date().toLocaleDateString(),
  exp: 1,
};

const mockPost: Post = {
  id: "1",
  userId: "1",
  groupId: "",
  postGroupId: "",
  body: "This is a test post",
  createdAt: new Date().toLocaleTimeString(),
  __typename: Common.TypeNames.Post,
};

const renderPost = async (): Promise<RenderResult> => {
  mockNextUseRouter("/posts/" + mockPost.id);
  return render(
    <MockedProvider>
        <Post post={mockPost} deletePost={deletePostHandler} />
    </MockedProvider>
  );
};

describe("Post", () => {
  beforeAll(() => {
    mocked(useWindowSize).mockReturnValueOnce([]);
  });

  it("should display the user's name and post body", async () => {
    mocked(useHasPermissionGlobally).mockReturnValue([true]);
    mocked(useUserById).mockReturnValue(mockUser);

    const { getByText, container } = await renderPost();
    const userName = getByText(mockUserName);
    const postBody = getByText(mockPost.body);

    await waitFor(() => expect(userName).toBeInTheDocument());
    await waitFor(() => expect(postBody).toBeInTheDocument());

    expect(container).toMatchSnapshot();
  });
});
