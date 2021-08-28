import { createTheme } from "@material-ui/core/styles";
import { DESKTOP_BREAKPOINT } from "../../constants/common";

export const BLURPLE = "#7289DA";
export const WHITE = "white";
export const BLACK = "black";

const globalTheme = createTheme({
  typography: {
    fontFamily: "Inter",
  },

  palette: {
    primary: {
      main: "rgb(190, 190, 190)",
      dark: "rgb(170, 170, 170)",
      contrastText: WHITE,
    },
    secondary: {
      main: "rgb(90, 90, 90)",
    },
    background: {
      paper: "rgb(65, 65, 65)",
    },
  },
});

const muiTheme = createTheme({
  ...globalTheme,

  overrides: {
    MuiCard: {
      root: {
        backgroundColor: globalTheme.palette.background.paper,
        marginBottom: 12,
      },
    },

    MuiTypography: {
      root: {
        color: globalTheme.palette.primary.main,
      },
      colorPrimary: {
        color: globalTheme.palette.primary.contrastText,
      },
      h3: {
        fontSize: 40,
      },
      h6: {
        marginBottom: 6,
        color: globalTheme.palette.primary.contrastText,
      },
      gutterBottom: {
        marginBottom: 24,
      },
    },

    MuiSvgIcon: {
      colorPrimary: {
        color: globalTheme.palette.primary.contrastText,
      },
      colorDisabled: {
        color: "rgb(100, 100, 100)",
      },
    },

    MuiInput: {
      root: {
        color: globalTheme.palette.primary.dark,
      },
    },

    MuiInputLabel: {
      root: {
        color: "rgb(105, 105, 105)",
      },
    },

    MuiSwitch: {
      root: {
        "& .Mui-checked .MuiSwitch-thumb": {
          color: globalTheme.palette.primary.light,
        },
        "& .MuiSwitch-thumb": {
          color: globalTheme.palette.primary.dark,
        },
      },
    },

    MuiButton: {
      textPrimary: {
        color: globalTheme.palette.primary.contrastText,
      },
      containedPrimary: {
        backgroundColor: globalTheme.palette.background.paper,
        "&:hover": {
          backgroundColor: "rgb(60, 60, 60)",
        },
      },
    },

    MuiMenu: {
      paper: {
        backgroundColor: globalTheme.palette.background.paper,
      },
      list: {
        color: globalTheme.palette.primary.contrastText,
      },
    },

    MuiPopover: {
      paper: {
        backgroundColor: globalTheme.palette.background.paper,
      },
    },

    MuiTabs: {
      indicator: {
        backgroundColor: WHITE,
      },
      scrollButtons: {
        color: WHITE,
      },
    },

    MuiTab: {
      textColorInherit: {
        color: globalTheme.palette.primary.contrastText,
      },
    },

    MuiBreadcrumbs: {
      root: {
        marginBottom: 18,
      },
      separator: {
        color: globalTheme.palette.primary.main,
      },
    },

    MuiBottomNavigation: {
      root: {
        backgroundColor: "rgb(30, 30, 30)",
        position: "fixed",
        bottom: 0,
        zIndex: 5,
        width: "100%",
        height: 70,
      },
    },

    MuiBottomNavigationAction: {
      root: {
        color: globalTheme.palette.primary.dark,
        "&$selected": {
          color: WHITE,
          paddingTop: 0,
        },
        paddingTop: 0,
      },
    },

    MuiDialog: {
      paper: {
        backgroundColor: "rgb(50, 50, 50)",
      },
    },

    MuiSnackbar: {
      anchorOriginBottomCenter: {
        bottom: 85,
      },
    },

    MuiCircularProgress: {
      colorPrimary: {
        color: globalTheme.palette.primary.contrastText,
      },
      root: {
        display: "block",
        margin: 12,
      },
    },

    MuiLinearProgress: {
      colorPrimary: {
        backgroundColor: globalTheme.palette.background.paper,
      },
      barColorPrimary: {
        backgroundColor: WHITE,
      },
      root: {
        margin: 12,
      },
    },

    MuiContainer: {
      root: {
        marginTop: 100,
        marginBottom: 200,
        [globalTheme.breakpoints.up(DESKTOP_BREAKPOINT)]: {
          marginTop: 75,
        },
      },
    },

    MuiDivider: {
      root: {
        backgroundColor: globalTheme.palette.secondary.main,
        marginTop: 6,
      },
    },
  },
});

export default muiTheme;
