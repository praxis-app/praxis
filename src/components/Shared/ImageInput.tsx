import { ChangeEvent, useRef } from "react";
import { Image } from "@material-ui/icons";

import styles from "../../styles/Shared/Shared.module.scss";

interface Props {
  setImage?: (image: File) => void;
  setImages?: (images: File[]) => void;
  multiple?: boolean;
  refreshKey: string;
}

const ImageInput = ({ setImage, setImages, multiple, refreshKey }: Props) => {
  const imageInput = useRef<HTMLInputElement>(null);

  const setImageState = (files: File[]) => {
    if (multiple && setImages) setImages(files);
    else if (setImage) setImage(files[0]);
  };

  return (
    <>
      <input
        multiple={multiple}
        type="file"
        accept="image/*"
        ref={imageInput}
        key={refreshKey}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          e.target.files && setImageState([...e.target.files])
        }
        className={styles.imageInput}
      />
      <Image
        className={styles.imageInputIcon}
        onClick={() => imageInput.current?.click()}
        fontSize="large"
      />
    </>
  );
};

export default ImageInput;
