import { Resolver } from "@nestjs/graphql";
import { ProposalActionEvent } from "./models/proposal-action-event.model";

@Resolver(() => ProposalActionEvent)
export class ProposalActionEventsResolver {}
