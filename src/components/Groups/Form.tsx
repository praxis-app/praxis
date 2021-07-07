import React, { useState, useEffect, ChangeEvent } from "react";
import { useMutation } from "@apollo/client";
import Router from "next/router";
import { FormGroup } from "@material-ui/core";
import { Image, RemoveCircle } from "@material-ui/icons";

import { CREATE_GROUP, UPDATE_GROUP } from "../../apollo/client/mutations";

import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { generateRandom } from "../../utils/common";
import SubmitButton from "../Shared/SubmitButton";
import TextInput from "../Shared/TextInput";

interface Props {
  group?: Group;
  isEditing?: boolean;
}

const GroupForm = ({ group, isEditing }: Props) => {
  const currentUser = useCurrentUser();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState<string>("");
  const imageInput = React.useRef<HTMLInputElement>(null);

  const [createGroup] = useMutation(CREATE_GROUP);
  const [updateGroup] = useMutation(UPDATE_GROUP);

  useEffect(() => {
    if (isEditing && group) {
      setName(group.name);
      setDescription(group.description);
    }
  }, [group, isEditing]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (currentUser) {
      try {
        if (isEditing && group) {
          const { data } = await updateGroup({
            variables: {
              id: group.id,
              name,
              description,
              coverPhoto,
            },
          });

          Router.push(`/groups/${data.updateGroup.group.name}`);
        } else {
          e.target.reset();
          setName("");
          setDescription("");
          setCoverPhoto(undefined);

          const { data } = await createGroup({
            variables: {
              name,
              description,
              coverPhoto,
              creatorId: currentUser.id,
            },
          });

          Router.push(`/groups/${data.createGroup.group.name}`);
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const removeSelectedCoverPhoto = () => {
    setCoverPhoto(undefined);
    setImageInputKey(generateRandom());
  };

  if (currentUser)
    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormGroup>
          <TextInput
            placeholder={Messages.groups.form.name()}
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <TextInput
            placeholder={Messages.groups.form.description()}
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />

          <input
            type="file"
            accept="image/*"
            ref={imageInput}
            key={imageInputKey}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              e.target.files && setCoverPhoto(e.target.files[0])
            }
            className={styles.imageInput}
          />
          <Image
            className={styles.imageInputIcon}
            onClick={() => imageInput.current?.click()}
            fontSize="large"
          />
        </FormGroup>

        {coverPhoto && (
          <div className={styles.selectedImages}>
            <img
              alt={Messages.images.couldNotRender()}
              className={styles.selectedImage}
              src={URL.createObjectURL(coverPhoto)}
            />

            <RemoveCircle
              color="primary"
              onClick={() => removeSelectedCoverPhoto()}
              className={styles.removeSelectedImageButton}
            />
          </div>
        )}

        <SubmitButton>
          {isEditing ? Messages.actions.save() : Messages.actions.create()}
        </SubmitButton>
      </form>
    );
  return <></>;
};

export default GroupForm;
