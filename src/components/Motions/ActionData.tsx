import { Typography } from "@material-ui/core";
import Link from "next/link";
import { Motions } from "../../constants";
import baseUrl from "../../utils/baseUrl";

interface TextProps {
  text: string;
  data: string | undefined;
}

const Text = ({ text, data }: TextProps) => {
  return (
    <Typography
      style={{
        color: "rgb(190, 190, 190)",
      }}
    >
      <span
        style={{
          fontFamily: "Inter Bold",
        }}
      >
        Proposed {text}:
      </span>
      {" " + data}
    </Typography>
  );
};

const ActionData = ({ motion }: { motion: Motion }) => {
  const { id, action, actionData } = motion;
  if (action === Motions.ActionTypes.ChangeName)
    return <Text text="name" data={actionData.newGroupName} />;

  if (action === Motions.ActionTypes.ChangeDescription)
    return <Text text="description" data={actionData.newGroupDescription} />;

  if (action === Motions.ActionTypes.ChangeImage)
    return (
      <>
        <div
          style={{
            fontFamily: "Inter Bold",
            color: "rgb(190, 190, 190)",
            marginBottom: 2,
          }}
        >
          Proposed image:
        </div>
        <Link href={`/motions/${id}`}>
          <a>
            <img
              src={baseUrl + actionData.newGroupImagePath}
              alt="Data could not render."
              style={{
                width: "60%",
                display: "block",
              }}
            />
          </a>
        </Link>
      </>
    );

  return <></>;
};

export default ActionData;
