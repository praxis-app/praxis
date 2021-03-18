import { useState, ChangeEvent } from "react";
import { FormGroup, Input, Button } from "@material-ui/core";

const ImagesForm = ({ handleSubmit }) => {
  const [image, setImage] = useState<File>(null);

  return (
    <form
      onSubmit={(e) => handleSubmit(e, image)}
      style={{ marginBottom: "12px" }}
    >
      <FormGroup>
        <Input
          type="file"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setImage(e.target.files[0])
          }
          style={{ fontSize: "10px", marginBottom: "12px" }}
        />
      </FormGroup>

      <Button variant="outlined" color="default" size="large" type="submit">
        Upload
      </Button>
    </form>
  );
};

export default ImagesForm;
