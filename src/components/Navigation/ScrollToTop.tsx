import { useEffect, useState } from "react";
import { IconButton } from "@material-ui/core";
import { Publish } from "@material-ui/icons";

import { useScrollPosition } from "../../hooks";
import { scrollTop } from "../../utils/common";

const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  const scrollPosition = useScrollPosition();

  useEffect(() => {
    setShow(scrollPosition > window.document.body.offsetHeight * 0.25);
  }, [scrollPosition]);

  if (!show) return null;

  return (
    <IconButton
      onClick={() => scrollTop()}
      style={{ position: "fixed", bottom: 5, right: 30 }}
    >
      <Publish color="primary" fontSize="small" />
    </IconButton>
  );
};

export default ScrollToTop;
