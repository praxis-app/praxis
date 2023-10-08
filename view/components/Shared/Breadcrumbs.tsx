import {
  Breadcrumbs as MuiBreadcrumbs,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import Link from './Link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Props {
  breadcrumbs: Breadcrumb[];
  sx?: SxProps;
}

const Breadcrumbs = ({ breadcrumbs, sx }: Props) => {
  const theme = useTheme();

  return (
    <MuiBreadcrumbs sx={{ marginBottom: 1.25, ...sx }}>
      {breadcrumbs.map(({ label, href }) => {
        if (href) {
          return (
            <Link
              href={href}
              key={href}
              sx={{ color: theme.palette.text.secondary }}
            >
              <Typography>{label}</Typography>
            </Link>
          );
        }
        return (
          <Typography color="primary" key={label}>
            {label}
          </Typography>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
