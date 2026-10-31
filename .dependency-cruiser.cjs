/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      comment: 'Warn or error when files depend on each other circular-style',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'design-system-not-to-apps',
      severity: 'error',
      comment: 'Design system library must not depend on application code',
      from: {
        path: '^libs/design-system'
      },
      to: {
        path: '^apps/'
      }
    },
    {
      name: 'core-not-to-features',
      severity: 'error',
      comment: 'Core layer must not depend on feature modules',
      from: {
        path: '^apps/web/src/app/core'
      },
      to: {
        path: '^apps/web/src/app/features'
      }
    },
    {
      name: 'shared-not-to-features',
      severity: 'error',
      comment: 'Shared layer must not depend on feature modules',
      from: {
        path: '^apps/web/src/app/shared'
      },
      to: {
        path: '^apps/web/src/app/features'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    }
  }
};
