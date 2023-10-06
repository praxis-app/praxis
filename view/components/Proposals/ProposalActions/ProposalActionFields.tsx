import { CropOriginal } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { FormikErrors, FormikTouched } from 'formik';
import { CreateProposalInput } from '../../../apollo/gen';
import { ProposalFormFragment } from '../../../apollo/proposals/generated/ProposalForm.fragment';
import {
  ProposalActionFieldName,
  ProposalActionType,
} from '../../../constants/proposal.constants';
import AttachedImagePreview from '../../Images/AttachedImagePreview';
import ImageInput from '../../Images/ImageInput';
import { TextField } from '../../Shared/TextField';
import { useTranslation } from 'react-i18next';

interface Props {
  editProposal?: ProposalFormFragment;
  errors: FormikErrors<CreateProposalInput>;
  setFieldValue: (field: string, value: any) => void;
  submitCount: number;
  touched: FormikTouched<CreateProposalInput>;
  values: CreateProposalInput;
}

const ProposalActionFields = ({
  editProposal,
  errors,
  setFieldValue,
  submitCount,
  touched,
  values,
}: Props) => {
  const { t } = useTranslation();

  if (values.action.actionType === ProposalActionType.ChangeName) {
    const isInvalid = !!errors.action?.groupName && touched.action?.groupName;
    return (
      <TextField
        autoComplete="off"
        error={isInvalid}
        label={t('proposals.labels.newGroupName')}
        name={ProposalActionFieldName.GroupName}
      />
    );
  }

  if (values.action.actionType === ProposalActionType.ChangeDescription) {
    const isInvalid =
      !!errors.action?.groupDescription && touched.action?.groupDescription;
    return (
      <TextField
        autoComplete="off"
        error={isInvalid}
        label={t('proposals.labels.newGroupDescription')}
        name={ProposalActionFieldName.GroupDescription}
      />
    );
  }

  if (values.action.actionType === ProposalActionType.ChangeCoverPhoto) {
    const isInvalid = !!(errors.action?.groupCoverPhoto && submitCount);
    const savedImage =
      editProposal?.action.groupCoverPhoto && !values.action.groupCoverPhoto
        ? [editProposal.action.groupCoverPhoto]
        : [];

    const handleChange = (images: File[]) =>
      setFieldValue(ProposalActionFieldName.GroupCoverPhoto, images[0]);

    return (
      <Box marginTop={1.5}>
        <AttachedImagePreview
          imageContainerStyles={{ marginBottom: 1 }}
          savedImages={savedImage}
          selectedImages={
            values.action.groupCoverPhoto ? [values.action.groupCoverPhoto] : []
          }
          sx={{ marginTop: 1 }}
        />

        <ImageInput
          sx={{ cursor: 'pointer', marginTop: 0 }}
          name={ProposalActionFieldName.GroupCoverPhoto}
          onChange={handleChange}
        >
          <Typography
            color={isInvalid ? 'error' : 'primary'}
            sx={{ display: 'flex', fontSize: 14 }}
          >
            <CropOriginal sx={{ marginRight: '0.25ch', fontSize: 20 }} />
            {t('proposals.actions.attachNewCoverPhoto')}
          </Typography>
        </ImageInput>

        {isInvalid && (
          <Typography color="error" fontSize="small" marginLeft={0.25}>
            {t('proposals.errors.missingGroupCoverPhoto')}
          </Typography>
        )}
      </Box>
    );
  }

  return null;
};

export default ProposalActionFields;
