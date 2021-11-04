import { ReactNode } from "react";

interface Props {
  href: string;
  children: ReactNode;
  newTab?: boolean;
}

const ExternalLink = ({ href, children, newTab }: Props) => {
  if (newTab)
    return (
      <a target="_blank" rel="noopener noreferrer" href={href}>
        {children}
      </a>
    );
  return <a href={href}>{children}</a>;
};

export default ExternalLink;
