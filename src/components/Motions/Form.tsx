import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import {
  FormGroup,
  FormControl,
  InputLabel,
  Divider,
  MenuItem,
  withStyles,
  createStyles,
  CardActions as MUICardActions,
  LinearProgress,
} from "@material-ui/core";
import Router, { useRouter } from "next/router";
import { Formik, FormikHelpers, Form, Field, FormikProps } from "formik";
import { truncate } from "lodash";

import Messages from "../../utils/messages";
import { IMAGES_BY_MOTION_ID } from "../../apollo/client/queries";
import {
  CREATE_MOTION,
  UPDATE_MOTION,
  DELETE_IMAGE,
} from "../../apollo/client/mutations";
import {
  FieldNames,
  NavigationPaths,
  ResourcePaths,
  TruncationSizes,
} from "../../constants/common";
import { ActionTypeOptions, ActionTypes } from "../../constants/motion";
import ActionFields from "./ActionFields";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { useCurrentUser, useIsMobile } from "../../hooks";
import { generateRandom } from "../../utils/common";
import { noCache } from "../../utils/apollo";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextFieldWithAvatar";
import SelectedImages from "../Images/Selected";
import ImageInput from "../Images/Input";
import Dropdown from "../Shared/Dropdown";
import FormToggle from "./FormToggle";
import GroupSettingsTab from "./GroupSettingsTab";
import ActionData from "./ActionData";

const CardActions = withStyles(() =>
  createStyles({
    root: {
      justifyContent: "space-between",
      padding: 0,
    },
  })
)(MUICardActions);

interface FormValues {
  body: string;
}

export interface MotionsFormProps {
  motion?: ClientMotion;
  motions?: ClientMotion[];
  isEditing?: boolean;
  setMotions?: (motions: ClientMotion[]) => void;
  group?: ClientGroup;
  groups?: ClientGroup[];
  groupsLoading?: boolean;
  closeModal?: () => void;
  withoutToggle?: boolean;
}

const MotionsForm = ({
  motion,
  motions,
  isEditing,
  setMotions,
  group,
  groups,
  groupsLoading,
  closeModal,
  withoutToggle,
}: MotionsFormProps) => {
  const currentUser = useCurrentUser();
  const [imagesInputKey, setImagesInputKey] = useState<string>("");
  const [savedImages, setSavedImages] = useState<ClientImage[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [action, setAction] = useState<string>("");
  const [actionData, setActionData] = useState<ActionData>();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [tab, setTab] = useState<number>(0);
  const [touched, setTouched] = useState<boolean>(false);
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const feed = useReactiveVar(feedVar);
  const isMobile = useIsMobile();

  const [createMotion] = useMutation(CREATE_MOTION);
  const [updateMotion] = useMutation(UPDATE_MOTION);
  const [deleteImage] = useMutation(DELETE_IMAGE);
  const [getSavedImagesRes, savedImagesRes] = useLazyQuery(
    IMAGES_BY_MOTION_ID,
    noCache
  );
  const { asPath: currentPath } = useRouter();

  useEffect(() => {
    if (isEditing && motion) {
      setAction(motion.action);
    }
  }, [motion, isEditing]);

  useEffect(() => {
    if (motion) getSavedImagesRes({ variables: { motionId: motion.id } });
  }, []);

  useEffect(() => {
    setSavedImages(
      savedImagesRes.data ? savedImagesRes.data.imagesByMotionId : []
    );
  }, [savedImagesRes.data]);

  useEffect(() => {
    if (action === ActionTypes.ChangeSettings && (group || selectedGroupId))
      setTab(1);
    else setTab(0);
  }, [action, group, selectedGroupId]);

  useEffect(() => {
    if (selectedGroupId) setActionData(undefined);
  }, [selectedGroupId]);

  const handleSubmit = async (
    { body }: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    if (currentUser) {
      try {
        if (isEditing && motion) {
          await updateMotion({
            variables: {
              id: motion.id,
              body,
              action,
              actionData,
              images,
            },
          });
          Router.push(`${ResourcePaths.Motion}${motion.id}`);
        } else {
          const { data } = await createMotion({
            variables: {
              body,
              images,
              action,
              actionData,
              userId: currentUser.id,
              groupId: group ? group.id : selectedGroupId,
            },
          });
          resetForm();
          setImages([]);
          setSelectedGroupId("");
          setAction("");
          setActionData(undefined);
          setSubmitting(false);
          setTouched(false);
          if (motions && setMotions)
            setMotions([data.createMotion.motion, ...motions]);
          else
            feedVar({
              ...feed,
              items: feedItemsAferCreate(data.createMotion.motion),
              totalItems: feed.totalItems + 1,
            });

          if (groups && selectedGroupId && closeModal) {
            closeModal();
            if (currentPath !== NavigationPaths.Home)
              Router.push(NavigationPaths.Home);
          }
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleActionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAction(event.target.value as string);
  };

  const handleGroupChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedGroupId(event.target.value as string);
  };

  const deleteImageHandler = async (id: string) => {
    await deleteImage({
      variables: {
        id,
      },
    });
    setSavedImages(savedImages.filter((image) => image.id !== id));
  };

  const removeSelectedImage = (imageName: string) => {
    setImages(
      [...images].filter((image) => {
        return image.name !== imageName;
      })
    );
    setImagesInputKey(generateRandom());
  };

  const isSubmitButtonDisabled = ({
    values: { body },
    isValid,
    isSubmitting,
  }: FormikProps<FormValues>): boolean => {
    if (!group && !selectedGroupId) return true;
    if (body === "") return true;
    if (!isValid) return true;
    return isSubmitting;
  };

  const feedItemsAferCreate = (newMotion: ClientMotion): ClientFeedItem[] => {
    let { items, totalItems } = feed;
    const totalPages = Math.ceil(totalItems / pageSize);
    const onLastPage = currentPage === totalPages - 1;
    if (totalItems > items.length && !onLastPage) items = items.slice(0, -1);
    return [newMotion, ...items];
  };

  const validateBody = (body: string) => {
    return body === "" && images.length === 0
      ? Messages.motions.form.motionEmpty()
      : undefined;
  };

  return (
    <Formik
      initialValues={{
        body: isEditing && motion ? motion.body : "",
      }}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <>
          {tab === 0 && (
            <Form onClick={() => setTouched(true)}>
              <FormGroup>
                <Field
                  name={FieldNames.Body}
                  placeholder={
                    formik.isSubmitting
                      ? Messages.states.loading()
                      : Messages.motions.form.makeAMotion()
                  }
                  component={TextField}
                  validate={validateBody}
                  multiline
                />

                {(formik.values.body || touched) && (
                  <>
                    <FormControl style={{ marginBottom: groups ? 6 : 18 }}>
                      <InputLabel>
                        {Messages.motions.form.motionType()}
                      </InputLabel>
                      <Dropdown value={action} onChange={handleActionChange}>
                        {ActionTypeOptions.map((option) => (
                          <MenuItem value={option.value} key={option.value}>
                            {option.message}
                          </MenuItem>
                        ))}
                      </Dropdown>
                    </FormControl>

                    {groups ? (
                      <FormControl style={{ marginBottom: 18 }}>
                        <InputLabel>{Messages.motions.form.group()}</InputLabel>
                        <Dropdown
                          value={selectedGroupId}
                          onChange={handleGroupChange}
                        >
                          {groups.map((group) => (
                            <MenuItem value={group.id} key={group.id}>
                              {truncate(group.name, {
                                length: isMobile
                                  ? TruncationSizes.Large
                                  : TruncationSizes.ExtraLarge,
                              })}
                            </MenuItem>
                          ))}
                        </Dropdown>
                      </FormControl>
                    ) : (
                      groupsLoading && <LinearProgress />
                    )}

                    <ActionFields
                      actionType={action}
                      setActionData={setActionData}
                    />
                  </>
                )}
              </FormGroup>

              <SelectedImages
                selectedImages={images}
                savedImages={savedImages}
                removeSelectedImage={removeSelectedImage}
                deleteSavedImage={deleteImageHandler}
              />

              {actionData && (
                <ActionData action={action} actionData={actionData} />
              )}

              {!touched &&
                (!formik.values.body ||
                  action === ActionTypes.ChangeImage ||
                  images.length + savedImages.length !== 0) && (
                  <Divider style={{ marginBottom: 18, marginTop: 18 }} />
                )}

              <CardActions>
                <div style={{ display: "flex", marginTop: -4 }}>
                  <ImageInput
                    setImages={setImages}
                    refreshKey={imagesInputKey}
                    multiple
                  />

                  {!withoutToggle && <FormToggle />}
                </div>

                <SubmitButton
                  disabled={isSubmitButtonDisabled(formik)}
                  style={{ marginTop: 4 }}
                >
                  {isEditing
                    ? Messages.actions.save()
                    : Messages.motions.actions.motion()}
                </SubmitButton>
              </CardActions>
            </Form>
          )}

          {tab === 1 && (
            <GroupSettingsTab
              groupId={group ? group.id : selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              setActionData={setActionData}
              setAction={setAction}
              resetTabs={() => setTab(0)}
            />
          )}
        </>
      )}
    </Formik>
  );
};

export default MotionsForm;
