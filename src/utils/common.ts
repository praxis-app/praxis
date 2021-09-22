import { isValidElement, ReactNode } from "react";
import { animateScroll } from "react-scroll";
import { SCROLL_DURATION } from "../constants/common";

export const generateRandom = (): string => {
  return Math.random()
    .toString(36)
    .slice(2, 10)
    .split("")
    .map((c) => {
      return Math.random() < 0.5 ? c : c.toUpperCase();
    })
    .join("");
};

export const scrollTop = () => {
  const options = { smooth: true, duration: SCROLL_DURATION };
  animateScroll.scrollToTop(options);
};

export const isRenderable = (node: ReactNode): boolean => {
  switch (typeof node) {
    case "string":
    case "number":
      return true;
    default:
      if (Array.isArray(node) && node.length) {
        return Boolean(node.reduce((a, b) => a && isRenderable(b), true));
      }
      return isValidElement(node);
  }
};
