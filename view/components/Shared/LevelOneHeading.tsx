import { Typography, TypographyProps } from '@mui/material';

interface Props extends TypographyProps {
  header?: boolean;
}

const LevelOneHeading = ({
  children,
  header,
  sx,
  ...typographyProps
}: Props) => {
  const getStyles = () => {
    const defaultStyles = {
      fontSize: 16,
      margin: 0,
      ...sx,
    };
    if (!header) {
      return defaultStyles;
    }
    return {
      ...defaultStyles,
      fontSize: 35,
      marginBottom: 3,
      marginTop: -1,
    };
  };

  return (
    <Typography variant="h1" sx={getStyles()} {...typographyProps}>
      {children}
    </Typography>
  );
};

export default LevelOneHeading;
