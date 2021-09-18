import { useState } from "react";
import { truncate } from "lodash";
import { TruncationSizes } from "../../constants/common";
import Messages from "../../utils/messages";
import { WHITE } from "../../styles/Shared/theme";

interface Props {
  text: string;
}

const CompactText = ({ text }: Props) => {
  const [showMore, setShowMore] = useState(false);

  if (showMore || text.length <= TruncationSizes.Large) return <>{text}</>;

  return (
    <>
      {truncate(text, {
        length: TruncationSizes.Large,
      }) + " "}
      <span
        onClick={() => setShowMore(true)}
        role="button"
        tabIndex={0}
        style={{ cursor: "pointer", color: WHITE }}
      >
        {Messages.actions.seeMore()}
      </span>
    </>
  );
};

export default CompactText;
