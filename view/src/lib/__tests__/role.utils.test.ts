import {
  getInstancePermissionValues,
  getServerPermissionValues,
  getSettingsAccess,
} from '@/lib/role.utils';
import { createMongoAbility } from '@casl/ability';
import { describe, expect, it } from 'vitest';

describe('audit log role mappings', () => {
  it('maps server and instance AuditLog read grants', () => {
    expect(
      getServerPermissionValues([{ subject: 'AuditLog', action: ['read'] }]),
    ).toContainEqual({ name: 'viewAuditLog', value: true });
    expect(
      getInstancePermissionValues([{ subject: 'AuditLog', action: ['read'] }]),
    ).toContainEqual({ name: 'viewAuditLog', value: true });
  });

  it('makes audit-only roles eligible for the matching settings section', () => {
    const access = getSettingsAccess(
      createMongoAbility([{ subject: 'AuditLog', action: ['read'] }]),
      createMongoAbility([]),
    );

    expect(access.canViewServerAuditLog).toBe(true);
    expect(access.hasServerSettingsAccess).toBe(true);
    expect(access.hasSettingsAccess).toBe(true);
  });
});
