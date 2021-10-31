import Image from "material-ui-image";
import muiTheme, { BLACK } from "../../styles/Shared/theme";
import { baseUrl } from "../../utils/clientIndex";
import { useIsMobile } from "../../hooks";

interface Props {
  path?: string;
  image?: File;
  rounded?: boolean;
  topRounded?: boolean;
  aspectRatioMobile?: number;
}

const CoverPhoto = ({
  path,
  image,
  rounded,
  topRounded,
  aspectRatioMobile,
}: Props) => {
  const isMobile = useIsMobile();
  return (
    <Image
      src={image ? URL.createObjectURL(image) : baseUrl + path}
      aspectRatio={isMobile ? (aspectRatioMobile ? aspectRatioMobile : 2) : 3}
      color={rounded ? muiTheme.palette.background.paper : BLACK}
      imageStyle={
        rounded
          ? { borderRadius: 8 }
          : topRounded
          ? { borderTopLeftRadius: 8, borderTopRightRadius: 8 }
          : {}
      }
      disableSpinner
      disableError
      cover
    />
  );
};

export default CoverPhoto;
