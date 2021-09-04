import { ChangeEvent, useRef } from "react";
import { Image } from "@material-ui/icons";
import styles from "../../styles/Image/Input.module.scss";

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
    <div className={styles.inputWrapper}>
      <Image
        onClick={() => imageInput.current?.click()}
        className={styles.imageInputIcon}
        style={{ fontSize: 40 }}
        color="primary"
      />
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
    </div>
  );
};

export default ImageInput;
