import { SERVER_PERMISSION_KEYS } from '@/constants/role.constants';
import { t } from '@/lib/shared.utils';
import { type ServerRoleRes } from '@/types/role.types';
import { type UserRes } from '@/types/user.types';
import { POLL_ACTION_TYPE } from '@/constants/poll-action.constants';
import { POLL_BODY_MAX } from '@/constants/poll.constants';
import * as zod from 'zod';
import {
  serverConfigSchema,
  type ServerConfigReq,
  type ServerConfigRes,
} from '@/types/server-config.types';

const isValidEventDateTime = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute
  );
};

export const createProposalFormSchema = zod
  .object({
    body: zod
      .string()
      .max(POLL_BODY_MAX, {
        message: t('proposals.errors.longBody'),
      })
      .optional(),
    serverRoleName: zod.string().optional(),
    serverRoleColor: zod.string().optional(),
    action: zod.enum([...POLL_ACTION_TYPE, '']),
    permissions: zod
      .record(zod.enum(SERVER_PERMISSION_KEYS), zod.boolean().optional())
      .optional(),
    serverRoleMembers: zod.array(zod.string()).optional(),
    selectedServerRoleId: zod.string().optional(),
    serverConfig: serverConfigSchema.optional(),
    eventName: zod.string().max(255).optional(),
    eventDescription: zod.string().optional(),
    eventStartsAt: zod.string().optional(),
    eventEndsAt: zod.string().optional(),
    eventOnline: zod.boolean().optional(),
    eventLocation: zod.string().max(255).optional(),
    eventExternalLink: zod.string().optional(),
    eventHostIds: zod.array(zod.string()).optional(),
    eventCoverPhoto: zod.instanceof(File).optional(),
    images: zod.array(zod.instanceof(File)),
  })
  .refine(
    (data) => {
      if (data.action === 'test') {
        return !!data.body;
      }
      return true;
    },
    {
      path: ['body'],
      message: t('proposals.errors.testProposalRequiresBody'),
    },
  )
  .refine(
    (data) => {
      if (data.action === 'general') {
        return !!data.body;
      }
      return true;
    },
    {
      path: ['body'],
      message: t('proposals.errors.generalProposalRequiresBody'),
    },
  )
  .superRefine((data, context) => {
    if (data.action !== 'plan-event') return;
    const required: Array<keyof typeof data> = [
      'eventName',
      'eventDescription',
    ];
    for (const field of required) {
      if (!data[field]) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: t('proposals.errors.eventRequired'),
        });
      }
    }
    const hasValidStart =
      !!data.eventStartsAt && isValidEventDateTime(data.eventStartsAt);
    if (!data.eventStartsAt) {
      context.addIssue({
        code: 'custom',
        path: ['eventStartsAt'],
        message: t('proposals.errors.eventRequired'),
      });
    } else if (!hasValidStart) {
      context.addIssue({
        code: 'custom',
        path: ['eventStartsAt'],
        message: t('proposals.errors.eventDateTimeInvalid'),
      });
    } else if (new Date(data.eventStartsAt) <= new Date()) {
      context.addIssue({
        code: 'custom',
        path: ['eventStartsAt'],
        message: t('proposals.errors.eventStartFuture'),
      });
    }
    const hasValidEnd =
      !data.eventEndsAt || isValidEventDateTime(data.eventEndsAt);
    if (!hasValidEnd) {
      context.addIssue({
        code: 'custom',
        path: ['eventEndsAt'],
        message: t('proposals.errors.eventDateTimeInvalid'),
      });
    }
    if (!data.eventOnline && !data.eventLocation?.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['eventLocation'],
        message: t('proposals.errors.eventLocationRequired'),
      });
    }
    if (!data.eventHostIds?.length) {
      context.addIssue({
        code: 'custom',
        path: ['eventHostIds'],
        message: t('proposals.errors.eventHostRequired'),
      });
    }
    if (
      hasValidStart &&
      data.eventEndsAt &&
      hasValidEnd &&
      new Date(data.eventEndsAt) <= new Date(data.eventStartsAt!)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['eventEndsAt'],
        message: t('proposals.errors.eventEndAfterStart'),
      });
    }
    if (data.eventExternalLink) {
      try {
        const url = new URL(data.eventExternalLink);
        if (url.protocol !== 'http:' && url.protocol !== 'https:')
          throw Error();
      } catch {
        context.addIssue({
          code: 'custom',
          path: ['eventExternalLink'],
          message: t('proposals.errors.eventLinkInvalid'),
        });
      }
    }
  })
  .refine(
    (data) =>
      data.action === 'general' ||
      data.action === 'change-role' ||
      data.action === 'change-settings' ||
      data.action === 'plan-event' ||
      data.action === 'test',
    {
      message: t('prompts.inDev'),
      path: ['action'],
    },
  );

export type CreateProposalFormSchema = zod.infer<
  typeof createProposalFormSchema
>;

export interface CreateProposalWizardContext {
  selectedServerRole?: ServerRoleRes;
  usersEligibleForServerRole?: UserRes[];
  serverConfig?: ServerConfigRes;
  proposedServerConfig?: ServerConfigReq;
  serverMembers?: UserRes[];
}
