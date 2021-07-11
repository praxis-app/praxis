import { Fragment } from "react";
import { RemoveCircle } from "@material-ui/icons";

import baseUrl from "../../utils/baseUrl";
import styles from "../../styles/Shared/Shared.module.scss";
import Messages from "../../utils/messages";

interface Props {
  selectedImages: File[];
  savedImages: Image[];
  deleteSavedImage: (id: string) => void;
  removeSelectedImage: (imageName: string) => void;
}

const SelectedImages = ({
  selectedImages,
  savedImages,
  removeSelectedImage,
  deleteSavedImage,
}: Props) => {
  if (!!selectedImages.length || !!savedImages.length)
    return (
      <div className={styles.selectedImages}>
        {[...selectedImages].map((image) => {
          return (
            <Fragment key={image.name}>
              <img
                alt={Messages.images.couldNotRender()}
                className={styles.selectedImage}
                src={URL.createObjectURL(image)}
              />

              <RemoveCircle
                color="primary"
                onClick={() => removeSelectedImage(image.name)}
                className={styles.removeSelectedImageButton}
              />
            </Fragment>
          );
        })}

        {savedImages.map(({ id, path }) => {
          return (
            <Fragment key={id}>
              <img
                alt={Messages.images.couldNotRender()}
                className={styles.selectedImage}
                src={baseUrl + path}
              />

              <RemoveCircle
                color="primary"
                onClick={() => deleteSavedImage(id)}
                className={styles.removeSelectedImageButton}
              />
            </Fragment>
          );
        })}
      </div>
    );
  return <></>;
};

export default SelectedImages;
