import Image from "material-ui-image";
import muiTheme, { BLACK } from "../../styles/Shared/theme";
import { useIsMobile } from "../../hooks";
import baseUrl from "../../utils/baseUrl";

interface Props {
  path?: string;
  image?: File;
  rounded?: boolean;
}

const CoverPhoto = ({ path, image, rounded }: Props) => {
  const isMobile = useIsMobile();
  return (
    <Image
      src={image ? URL.createObjectURL(image) : baseUrl + path}
      aspectRatio={isMobile ? 2 : 3}
      color={rounded ? muiTheme.palette.background.paper : BLACK}
      imageStyle={rounded ? { borderRadius: 8 } : {}}
      disableSpinner
      disableError
      cover={true}
    />
  );
};

export default CoverPhoto;
