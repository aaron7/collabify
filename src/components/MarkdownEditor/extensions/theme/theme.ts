import { syntaxHighlighting } from '@codemirror/language';

import { darkHighlightStyle, darkTheme } from './dark';
import { lightHighlightStyle, lightTheme } from './light';

export const getTheme = (theme: string) => {
  switch (theme) {
    case 'dark': {
      return [darkTheme, syntaxHighlighting(darkHighlightStyle)];
    }
    default: {
      return [lightTheme, syntaxHighlighting(lightHighlightStyle)];
    }
  }
};
