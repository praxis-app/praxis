import { Card, CardContent } from '@/components/ui/card';
import {
  USER_SETTINGS_SECTION_PARAM,
  type UserSettingsSections,
} from '@/constants/shared.constants';
import copy from 'copy-to-clipboard';
import { type ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const copySectionLink = (section: UserSettingsSections) => {
  const link = new URL(window.location.href);
  link.hash = '';
  link.search = '';
  link.searchParams.set(USER_SETTINGS_SECTION_PARAM, section);
  copy(link.toString());
};

interface Props {
  section: UserSettingsSections;
  title: string;
  description: string;
  isFirst?: boolean;
  children: ReactNode;
}

export const UserSettingsSection = ({
  section,
  title,
  description,
  isFirst = false,
  children,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const isSelected = searchParams.get(USER_SETTINGS_SECTION_PARAM) === section;
  const headingId = `${section}-settings-heading`;

  useEffect(() => {
    if (!isSelected) {
      return;
    }
    if (isFirst) {
      window.scrollTo({ top: 0 });
      return;
    }
    sectionRef.current?.scrollIntoView({ block: 'start' });
  }, [isFirst, isSelected]);

  const handleHeaderClick = () => {
    setSearchParams({ [USER_SETTINGS_SECTION_PARAM]: section });
    copySectionLink(section);
    toast(t('settings.prompts.sectionLinkCopied'));
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className="scroll-mt-4"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        <button
          type="button"
          onClick={handleHeaderClick}
          className="hover:text-primary cursor-pointer"
        >
          {title}
        </button>
      </h2>
      <p className="text-muted-foreground mt-1 mb-4 text-sm">{description}</p>
      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
};
