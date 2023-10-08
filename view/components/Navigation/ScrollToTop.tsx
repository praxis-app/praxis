import { Publish } from '@mui/icons-material';
import { IconButton, SxProps } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScrollPosition } from '../../hooks/shared.hooks';
import { scrollTop } from '../../utils/shared.utils';

const ICON_BUTTON_STYLES: SxProps = {
  position: 'fixed',
  bottom: 5,
  right: 35,
};

const ScrollToTop = () => {
  const [show, setShow] = useState(false);

  const { t } = useTranslation();
  const scrollPosition = useScrollPosition();

  useEffect(() => {
    setShow(scrollPosition > window.document.body.offsetHeight * 0.25);
  }, [scrollPosition]);

  if (!show) {
    return null;
  }

  return (
    <IconButton
      aria-label={t('labels.scrollToTop')}
      onClick={() => scrollTop()}
      sx={ICON_BUTTON_STYLES}
    >
      <Publish />
    </IconButton>
  );
};

export default ScrollToTop;
