import { setCompodocJson } from '@storybook/addon-docs/angular';
import type { Preview } from '@storybook/angular';
import docJson from '../documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    options: {
      storySort: {
        order: ['Introdução', 'Fundação', 'Primitivos', 'Navegação', 'Dados', 'Overlays', 'Gráficos', 'DLQ', 'Páginas'],
      },
    },
    a11y: { test: 'todo' },
  },
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Escuro', icon: 'moon' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (story, context) => {
      document.documentElement.dataset['theme'] = String(context.globals['theme'] ?? 'light');
      return story();
    },
  ],
};

export default preview;
