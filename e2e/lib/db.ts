import { execFileSync } from 'node:child_process';

type DatabaseCommandOptions = {
  tuplesOnly?: boolean;
};

export function assertUuid(value: string, label = 'ID') {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error(`${label} is not a valid UUID.`);
  }
}

export function runDatabaseCommand(
  command: string,
  { tuplesOnly = false }: DatabaseCommandOptions = {},
): string {
  return execFileSync(
    'docker',
    [
      'compose',
      '-f',
      'e2e/docker-compose.e2e.yml',
      'exec',
      '-T',
      'database',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      ...(tuplesOnly ? ['-t', '-A'] : []),
      '-c',
      command,
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8' as const,
    },
  );
}
