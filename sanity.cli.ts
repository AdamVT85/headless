/**
 * SANITY CLI CONFIGURATION
 * This file is used by Sanity CLI commands
 */

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'jhm6yd7l',
    dataset: 'production',
  },
});
