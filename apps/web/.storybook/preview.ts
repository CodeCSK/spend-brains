import '@fontsource-variable/outfit/wght.css'
import type { Preview } from '@storybook/react'

import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
    options: {
      storySort: {
        order: ['Foundation', 'UI', '*'],
      },
    },
    docs: {
      toc: true,
    },
  },
}

export default preview
