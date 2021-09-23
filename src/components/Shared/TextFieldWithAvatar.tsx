import { useRef } from "react";
import { withStyles, createStyles, Theme } from "@material-ui/core";
import { InputBase, InputBaseProps } from "formik-material-ui";
import { useCurrentUser, useUserById } from "../../hooks";
import styles from "../../styles/Shared/TextFieldWithAvatar.module.scss";
import UserAvatar from "../Users/Avatar";

const StyledTextField = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      marginLeft: 12,
      marginTop: 6,
    },
    input: {
      fontSize: 20,
      fontFamily: "Inter Light",
      color: theme.palette.primary.light,
      "&::placeholder": {
        color: theme.palette.primary.contrastText,
      },
    },
  })
)(InputBase);

const TextField = (props: InputBaseProps) => {
  const currentUser = useCurrentUser();
  const [user] = useUserById(currentUser?.id);
  const ref = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    ref.current?.focus();
  };

  return (
    <div className={styles.textFieldWrapper}>
      <UserAvatar user={user} onClick={handleAvatarClick} withoutLink />
      <StyledTextField {...props} type="text" inputRef={ref} />
    </div>
  );
};

export default TextField;
