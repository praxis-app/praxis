import { Select, SelectProps } from "@material-ui/core";

const Dropdown = (props: SelectProps) => {
  return (
    <Select
      {...props}
      MenuProps={{
        getContentAnchorEl: null,
      }}
    >
      {props.children}
    </Select>
  );
};

export default Dropdown;
