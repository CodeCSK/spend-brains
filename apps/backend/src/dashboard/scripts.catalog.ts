export interface NpmScriptEntry {
  name: string;
  group: 'development' | 'database' | 'test' | 'quality';
  description: string;
  when: string;
}

export const NPM_SCRIPT_GROUPS: Record<NpmScriptEntry['group'], string> = {
  development: 'Development',
  database: 'Database',
  test: 'Test',
  quality: 'Code quality',
};

export const NPM_SCRIPT_CATALOG: NpmScriptEntry[] = [
  {
    name: 'start:dev',
    group: 'development',
    description: 'Dev server with hot reload.',
    when: 'Daily local work.',
  },
  {
    name: 'start',
    group: 'development',
    description: 'Start server once, no watch.',
    when: 'Quick run without reload.',
  },
  {
    name: 'start:debug',
    group: 'development',
    description: 'Start with Node inspector.',
    when: 'IDE debugging.',
  },
  {
    name: 'start:prod',
    group: 'development',
    description: 'Run compiled dist/ output.',
    when: 'Verify production build locally.',
  },
  {
    name: 'build',
    group: 'development',
    description: 'Compile TypeScript to dist/.',
    when: 'Before prod run or CI.',
  },
  {
    name: 'db:migrate',
    group: 'database',
    description: 'Apply Prisma migrations.',
    when: 'After schema changes or first setup.',
  },
  {
    name: 'db:generate',
    group: 'database',
    description: 'Regenerate Prisma Client.',
    when: 'After schema edits or git pull.',
  },
  {
    name: 'db:studio',
    group: 'database',
    description: 'Open Prisma Studio GUI.',
    when: 'Browse or edit DB rows.',
  },
  {
    name: 'test:e2e',
    group: 'test',
    description: 'End-to-end route tests.',
    when: 'Before commit; after wiring changes.',
  },
  {
    name: 'test',
    group: 'test',
    description: 'Unit tests (Jest).',
    when: 'Isolated logic checks.',
  },
  {
    name: 'test:watch',
    group: 'test',
    description: 'Unit tests in watch mode.',
    when: 'TDD on one module.',
  },
  {
    name: 'test:cov',
    group: 'test',
    description: 'Unit tests + coverage report.',
    when: 'Coverage review.',
  },
  {
    name: 'lint',
    group: 'quality',
    description: 'ESLint with auto-fix.',
    when: 'Before commit.',
  },
  {
    name: 'format',
    group: 'quality',
    description: 'Prettier format pass.',
    when: 'Fix inconsistent formatting.',
  },
];

export function npmRunCommand(scriptName: string): string {
  return `npm run ${scriptName}`;
}

export const GROUP_ORDER: NpmScriptEntry['group'][] = [
  'development',
  'database',
  'test',
  'quality',
];
