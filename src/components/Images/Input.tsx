import { ChangeEvent, ReactNode, useRef } from "react";
import { CSSProperties } from "@material-ui/styles";
import { Image } from "@material-ui/icons";
import styles from "../../styles/Image/Input.module.scss";

interface Props {
  setImage?: (image: File) => void;
  setImages?: (images: File[]) => void;
  multiple?: boolean;
  refreshKey?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

const ImageInput = ({
  setImage,
  setImages,
  multiple,
  refreshKey,
  children,
  style,
}: Props) => {
  const imageInput = useRef<HTMLInputElement>(null);

  const setImageState = (files: File[]) => {
    if (multiple && setImages) setImages(files);
    else if (setImage) setImage(files[0]);
  };

  return (
    <div className={styles.inputWrapper} style={style}>
      <div
        onClick={() => imageInput.current?.click()}
        role="button"
        tabIndex={0}
      >
        {!children ? (
          <Image
            className={styles.imageInputIcon}
            style={{ fontSize: 40 }}
            color="primary"
          />
        ) : (
          children
        )}
      </div>
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
