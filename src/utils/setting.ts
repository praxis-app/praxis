import { GroupSettings } from "../constants/setting";
import Messages from "./messages";

export const descriptionByName = (name: string) => {
  const descriptions = Messages.settings.groups.descriptions;
  switch (name) {
    case GroupSettings.NoAdmin:
      return descriptions.noAdmin();
    case GroupSettings.VotingType:
      return descriptions.votingType();
    case GroupSettings.RatificationThreshold:
      return descriptions.ratificationThreshold();
    case GroupSettings.ReservationsLimit:
      return descriptions.reservationsLimit();
    case GroupSettings.StandAsidesLimit:
      return descriptions.standAsidesLimit();
    case GroupSettings.XToPass:
      return descriptions.xToPass();
    case GroupSettings.XToBlock:
      return descriptions.xToBlock();
  }
};
