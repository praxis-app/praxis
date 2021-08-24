import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Input, Typography } from "@material-ui/core";
import { Image } from "@material-ui/icons";

import {
  ActionTypes,
  ActionData as MotionActionData,
} from "../../constants/motion";
import { GroupAspects } from "../../constants/group";
import styles from "../../styles/Motion/ActionFields.module.scss";
import Messages from "../../utils/messages";

interface TextInputProps {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
}

const TextInput = ({ value, setValue, placeholder }: TextInputProps) => {
  return (
    <Input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      style={{
        marginBottom: "24px",
      }}
    />
  );
};

interface Props {
  actionType: string;
  setActionData: (actionData: ActionData) => void;
}

const ActionFields = ({ actionType, setActionData }: Props) => {
  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<File>();
  const imagesInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!!text.length) {
      let actionData = MotionActionData.NewGroupName;
      if (actionType === ActionTypes.ChangeDescription)
        actionData = MotionActionData.NewGroupDescription;
      setActionData({
        [actionData]: text,
      });
    }
    if (image && ActionTypes.ChangeImage) {
      setActionData({
        [MotionActionData.NewGroupImage]: image,
      });
    }
  }, [text, image, actionType]);

  if (actionType === ActionTypes.ChangeName)
    return (
      <TextInput
        placeholder={Messages.motions.groups.actionFields.newAspect(
          GroupAspects.Name
        )}
        value={text}
        setValue={setText}
      />
    );

  if (actionType === ActionTypes.ChangeDescription)
    return (
      <TextInput
        placeholder={Messages.motions.groups.actionFields.newAspect(
          GroupAspects.Description
        )}
        value={text}
        setValue={setText}
      />
    );

  if (actionType === ActionTypes.ChangeImage)
    return (
      <>
        {image && (
          <img
            alt={Messages.images.couldNotRender()}
            src={URL.createObjectURL(image)}
            style={{
              width: "50%",
              display: "block",
              marginBottom: 6,
            }}
          />
        )}

        <input
          type="file"
          accept="image/*"
          ref={imagesInput}
          className={styles.imageInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            e.target.files && setImage(e.target.files[0])
          }
        />
        <div
          className={styles.attachImage}
          onClick={() => imagesInput.current?.click()}
          role="button"
          tabIndex={0}
        >
          <Image className={styles.imageInputIcon} fontSize="small" />
          <span className={styles.attachImageText}>
            {Messages.motions.groups.actionFields.attachImage()}
          </span>
        </div>
      </>
    );

  if (actionType && actionType !== ActionTypes.Test)
    return (
      <Typography gutterBottom>
        {Messages.motions.groups.actionFields.inDev()}
      </Typography>
    );

  return null;
};

export default ActionFields;
