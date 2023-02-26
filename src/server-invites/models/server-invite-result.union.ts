import { createUnionType } from "@nestjs/graphql";
import { UserInputError } from "../../common/models/user-input-error.model";
import { ValidationError } from "../../common/models/validation-error.model";
import { ServerInvite } from "./server-invite.model";

export const ServerInviteResult = createUnionType({
  name: "ServerInviteResult",
  types: () => [ServerInvite, UserInputError, ValidationError] as const,
});
