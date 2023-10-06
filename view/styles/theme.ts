import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

export enum DarkMode {
  Placebo = '#e4e6ea',
  NimbusCloud = '#d3d5d9',
  Casper = '#b1b3b8',
  Liver = '#505051',
  DeadPixel = '#3a3b3c',
  PhantomShip = '#303233',
  Nero = '#242526',
  PianoBlack = '#18191a',
}

export enum Blurple {
  BlueWhale = '#222d3e',
  Marina = '#687CD4',
  PoolWater = '#3b86f7',
  SavoryBlue = '#5969CB',
  SkyDancer = '#588cf2',
}

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    secondary: string;
  }
}

const initialTheme = createTheme({
  typography: {
    fontFamily: 'Inter',
  },

  palette: {
    mode: 'dark',
    primary: {
      main: DarkMode.Placebo,
    },
    text: {
      primary: DarkMode.Placebo,
      secondary: DarkMode.Casper,
    },
    background: {
      default: DarkMode.PianoBlack,
      paper: DarkMode.Nero,
      secondary: DarkMode.DeadPixel,
    },
    divider: DarkMode.DeadPixel,
  },
});

const theme = createTheme(initialTheme, {
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          // Mobile (first priority)
          padding: '85px 10px 150px 10px',

          // Tablet
          [initialTheme.breakpoints.up('sm')]: {
            padding: '105px 24px 150px 24px',
          },

          // Desktop
          [initialTheme.breakpoints.up('md')]: {
            paddingBottom: 130,
            paddingTop: 115,
          },

          // Larger devices
          [initialTheme.breakpoints.up('lg')]: {
            paddingTop: 135,
          },
        },
        maxWidthSm: {
          [initialTheme.breakpoints.up('md')]: {
            maxWidth: 680,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 8,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          marginBottom: 12,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingRight: 16,
          paddingLeft: 16,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        startIcon: {
          marginRight: '0.6ch',
        },
      },
    },

    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: initialTheme.palette.background.paper,
          borderTop: `0.1px solid ${initialTheme.palette.background.default}`,
          height: 70,

          [initialTheme.breakpoints.up('md')]: {
            borderTop: `1px solid ${initialTheme.palette.divider}`,
          },
        },
      },
    },

    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: initialTheme.palette.action.active,
          },
          color: initialTheme.palette.text.secondary,
          transition: 'background-color 0.2s',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: 16,
          textTransform: 'none',

          [initialTheme.breakpoints.up('sm')]: {
            minWidth: 160,
          },
        },
      },
    },

    MuiInput: {
      styleOverrides: {
        root: {
          color: DarkMode.Placebo,
        },
        underline: {
          '&:before': {
            borderBottom: `1px solid ${initialTheme.palette.divider}`,
          },
          '&:after': {
            borderBottom: `2px solid ${initialTheme.palette.primary.dark}`,
          },
          '&&:hover:before': {
            borderBottom: `2px solid ${initialTheme.palette.primary.dark}`,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: initialTheme.palette.primary.dark,
          '&.Mui-focused': {
            color: initialTheme.palette.primary.light,
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: {
          color: initialTheme.palette.primary.dark,
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: {
          opacity: 0.9,

          '& .MuiSwitch-thumb': {
            color: grey[400],
          },
          '& .Mui-checked .MuiSwitch-thumb': {
            backgroundColor: grey[300],
          },
          '& .MuiSwitch-track': {
            backgroundColor: grey[900],
            transition: '0.4s',
            opacity: 1,
          },
        },
      },
    },
  },
});

export default theme;
