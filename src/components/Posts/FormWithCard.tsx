import { Card, CardContent } from "@material-ui/core";
import PostsForm, { PostsFormProps } from "./Form";

const PostsFormWithCard = (props: PostsFormProps) => {
  return (
    <Card>
      <CardContent style={{ paddingBottom: 18 }}>
        <PostsForm {...props} />
      </CardContent>
    </Card>
  );
};

export default PostsFormWithCard;
