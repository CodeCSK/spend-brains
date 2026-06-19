import type { Decorator } from '@storybook/react'
import { Provider } from 'react-redux'

import { store } from '../../lib/store'

export const withReduxProvider: Decorator = (Story) => (
  <Provider store={store}>
    <Story />
  </Provider>
)
