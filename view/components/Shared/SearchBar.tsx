// TODO: Add basic functionality for search

import { Search as SearchIcon } from '@mui/icons-material';
import { Box, InputBase, styled, SxProps, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldNames } from '../../constants/shared.constants';
import { inDevToast } from '../../utils/shared.utils';

const SearchInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    color: theme.palette.common.white,
    padding: theme.spacing(0.5, 1, 0, 1),
    transition: theme.transitions.create('width'),
    width: 230,
    [theme.breakpoints.down('lg')]: {
      width: 215,
    },
    [theme.breakpoints.down('sm')]: {
      width: 120,
    },
  },
}));

const SEARCH_ICON_STYLES: SxProps = {
  transition: '0.2s',
  position: 'relative',
  top: 7,
};

const SearchBar = () => {
  const [focused, setFocused] = useState<boolean>(false);
  const { t } = useTranslation();
  const theme = useTheme();

  const initialValues = { query: '' };

  const searchBarStyles: SxProps = {
    backgroundColor: theme.palette.background.secondary,
    borderRadius: '8px',
    marginTop: 0.5,
    height: 35,
  };
  const searchIconBoxStyles: SxProps = {
    color: focused ? grey[100] : 'rgba(255, 255, 255, 0.40)',
    display: 'inline-block',
    height: '100%',
    paddingLeft: 2,
    pointerEvents: 'none',
  };

  return (
    <Box sx={searchBarStyles}>
      <Formik initialValues={initialValues} onSubmit={inDevToast}>
        {() => (
          <Form>
            <Box sx={searchIconBoxStyles}>
              <SearchIcon sx={SEARCH_ICON_STYLES} />
            </Box>

            <Field
              component={SearchInput}
              name={FieldNames.Query}
              onBlur={() => setFocused(false)}
              onFocus={() => setFocused(true)}
              placeholder={t('search.placeholder')}
            />
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default SearchBar;
