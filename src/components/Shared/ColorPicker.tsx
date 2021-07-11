import { useState } from "react";
import { CirclePicker, ColorResult } from "react-color";
import { ArrowForwardIos } from "@material-ui/icons";

import styles from "../../styles/Shared/ColorPicker.module.scss";
import Messages from "../../utils/messages";

interface Props {
  label: string;
  color: string;
  onChange: (color: ColorResult) => void;
}

const ColorPicker = ({ label, color, onChange }: Props) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => setOpen(!open)}
        className={styles.field}
        role="button"
        tabIndex={0}
      >
        <div>{label}</div>
        <div className={styles.color}>
          <div
            style={{ backgroundColor: color }}
            className={styles.colorSquare}
          ></div>
          <div className={styles.colorHex}>{color}</div>
          <ArrowForwardIos fontSize="small" style={{ marginTop: 3 }} />
        </div>
      </div>

      {open && (
        <div className={styles.colorPickerWrapper}>
          <div className={styles.pickPrompt}>
            {Messages.actions.pickColor()}
          </div>
          <CirclePicker onChangeComplete={onChange} />
        </div>
      )}
    </>
  );
};

export default ColorPicker;
