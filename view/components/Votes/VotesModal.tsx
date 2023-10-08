import {
  PanTool,
  SvgIconComponent,
  ThumbDown,
  ThumbsUpDown,
  ThumbUp,
} from '@mui/icons-material';
import { Box, styled, Tab as MuiTab, Tabs } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VoteFragment } from '../../apollo/votes/generated/Vote.fragment';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { DarkMode } from '../../styles/theme';
import Modal from '../Shared/Modal';
import VoteList from './VoteList';

const Tab = styled(MuiTab)(() => ({
  color: DarkMode.NimbusCloud,
}));

interface Props {
  open: boolean;
  allVotes: VoteFragment[];
  agreements: VoteFragment[];
  reservations: VoteFragment[];
  standAsides: VoteFragment[];
  blocks: VoteFragment[];
  onClose(): void;
}

const VotesModal = ({
  open,
  allVotes,
  agreements,
  reservations,
  standAsides,
  blocks,
  onClose,
}: Props) => {
  const [tab, setTab] = useState(0);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const handleTabChange = (_: SyntheticEvent<Element, Event>, value: number) =>
    setTab(value);

  const renderTabLabel = (Icon: SvgIconComponent, voteCount: number) => (
    <Box sx={{ transform: 'translateY(-1px)' }}>
      <Icon
        color="inherit"
        sx={{ marginRight: 1, transform: 'translateY(4px)', fontSize: 18 }}
      />
      {voteCount}
    </Box>
  );

  const renderAppBarContent = () => (
    <Tabs
      onChange={handleTabChange}
      scrollButtons="auto"
      value={tab}
      variant="scrollable"
    >
      <Tab label={t('labels.all')} />
      <Tab
        label={renderTabLabel(ThumbUp, agreements.length)}
        sx={{ display: agreements.length ? 'initial' : 'none' }}
      />
      <Tab
        label={renderTabLabel(ThumbsUpDown, reservations.length)}
        sx={{ display: reservations.length ? 'initial' : 'none' }}
      />
      <Tab
        label={renderTabLabel(ThumbDown, standAsides.length)}
        sx={{ display: standAsides.length ? 'initial' : 'none' }}
      />
      <Tab
        label={renderTabLabel(PanTool, blocks.length)}
        sx={{ display: blocks.length ? 'initial' : 'none' }}
      />
    </Tabs>
  );

  return (
    <Modal
      appBarContent={renderAppBarContent()}
      contentStyles={{ paddingTop: 5 }}
      onClose={onClose}
      open={open}
      topGap={isDesktop ? undefined : '18vh'}
    >
      {tab === 0 && <VoteList votes={allVotes} />}
      {tab === 1 && <VoteList votes={agreements} />}
      {tab === 2 && <VoteList votes={reservations} />}
      {tab === 3 && <VoteList votes={standAsides} />}
      {tab === 4 && <VoteList votes={blocks} />}
    </Modal>
  );
};

export default VotesModal;
