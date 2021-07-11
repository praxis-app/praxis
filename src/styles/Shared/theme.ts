import { createMuiTheme } from "@material-ui/core/styles";

const globalTheme = createMuiTheme({
  typography: {
    fontFamily: "Inter",
  },

  palette: {
    primary: {
      main: "rgb(190, 190, 190)",
      dark: "rgb(170, 170, 170)",
      contrastText: "white",
    },
    background: {
      default: "rgb(65, 65, 65)",
    },
  },
});

const muiTheme = createMuiTheme({
  ...globalTheme,

  overrides: {
    MuiCard: {
      root: {
        backgroundColor: globalTheme.palette.background.default,
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

    MuiNativeSelect: {
      select: {
        color: globalTheme.palette.primary.dark,
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
        backgroundColor: globalTheme.palette.background.default,
        "&:hover": {
          backgroundColor: "rgb(60, 60, 60)",
        },
      },
    },

    MuiMenu: {
      paper: {
        backgroundColor: globalTheme.palette.background.default,
      },
      list: {
        color: globalTheme.palette.primary.contrastText,
      },
    },

    MuiTabs: {
      indicator: {
        backgroundColor: "white",
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

    MuiDialog: {
      paper: {
        backgroundColor: "rgb(50, 50, 50)",
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
        backgroundColor: globalTheme.palette.background.default,
      },
      barColorPrimary: {
        backgroundColor: "white",
      },
      root: {
        margin: 12,
      },
    },

    MuiContainer: {
      root: {
        marginBottom: 200,
      },
    },
  },
});

export default muiTheme;
