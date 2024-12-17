// eslint-disable-next-line import/no-extraneous-dependencies
import plugin from 'tailwindcss/plugin';


const dataAttributes = [
  {
    name: '',
    attr: 'data-orientation',
    values: [
      'vertical',
      'horizontal',
    ],
  },
  {
    name: '',
    attr: 'data-state',
    values: [
      'open',
      'closed',
      'active',
      'checked',
      'unchecked',
      'indeterminate',
      'complete',
      'loading',
      'visible',
      'hidden',
    ],
  },
  {
    name: 'side',
    attr: 'data-side',
    values: [
      'left',
      'right',
      'top',
      'bottom',
    ],
  },
  {
    name: 'align',
    attr: 'data-align',
    values: [
      'start',
      'end',
      'center',
    ],
  },
  {
    name: 'swipe',
    attr: 'data-swipe',
    values: [
      'start',
      'move',
      'cancel',
      'end',
    ],
  },
  {
    name: 'swipe',
    attr: 'data-swipe-direction',
    values: [
      'up',
      'down',
      'left',
      'right',
    ],
  },
  {
    name: 'disabled',
    attr: 'data-disabled',
    type: 'boolean',
  },
  {
    name: 'highlighted',
    attr: 'data-highlighted',
    type: 'boolean',
  },
  {
    name: 'placeholder',
    attr: 'data-placeholder',
    type: 'boolean',
  },
];

const spacingsMaps = {
  'rx-collapsible-width': 'var(--radix-collapsible-content-width)',
  'rx-collapsible-height': 'var(--radix-collapsible-content-height)',

  'rx-popover-height': 'var(--radix-popover-content-available-height)',

  'rx-context-menu-width': 'var(--radix-context-menu-content-available-width)',
  'rx-context-menu-height': 'var(--radix-context-menu-content-available-height)',
  'rx-context-menu-trigger-width': 'var(--radix-context-menu-trigger-width)',
  'rx-context-menu-trigger-height': 'var(--radix-context-menu-trigger-height)',

  'rx-dropdown-menu-width': 'var(--radix-dropdown-menu-content-available-width)',
  'rx-dropdown-menu-height': 'var(--radix-dropdown-menu-content-available-height)',
  'rx-dropdown-menu-trigger-width': 'var(--radix-dropdown-menu-trigger-width)',
  'rx-dropdown-menu-trigger-height': 'var(--radix-dropdown-menu-trigger-height)',

  'rx-hover-card-width': 'var(--radix-hover-card-content-available-width)',
  'rx-hover-card-height': 'var(--radix-hover-card-content-available-height)',
  'rx-hover-card-trigger-width': 'var(--radix-hover-card-trigger-width)',
  'rx-hover-card-trigger-height': 'var(--radix-hover-card-trigger-height)',

  'rx-menubar-width': 'var(--radix-menubar-content-available-width)',
  'rx-menubar-height': 'var(--radix-menubar-content-available-height)',
  'rx-menubar-trigger-width': 'var(--radix-menubar-trigger-width)',
  'rx-menubar-trigger-height': 'var(--radix-menubar-trigger-height)',

  'rx-select-width': 'var(--radix-select-content-available-width)',
  'rx-select-height': 'var(--radix-select-content-available-height)',
  'rx-select-trigger-width': 'var(--radix-select-trigger-width)',
  'rx-select-trigger-height': 'var(--radix-select-trigger-height)',

  'rx-tooltip-width': 'var(--radix-tooltip-content-available-width)',
  'rx-tooltip-height': 'var(--radix-tooltip-content-available-height)',
  'rx-tooltip-trigger-width': 'var(--radix-tooltip-trigger-width)',
  'rx-tooltip-trigger-height': 'var(--radix-tooltip-trigger-height)',

  'rx-navigation-menu-width': 'var(--radix-navigation-menu-viewport-width)',
  'rx-navigation-menu-height': 'var(--radix-navigation-menu-viewport-height)',
};

export default plugin(({addVariant}) => {
  const prefix = 'rx';
  for (const attr of dataAttributes) {
    const variantBaseName = attr.name ? [prefix, attr.name] : [prefix];

    if (attr.type === 'boolean' && attr.name) {
      addVariant(variantBaseName.join('-'), [
        `&[${attr.attr}]`,
        `:where([${attr.attr}]) &`,
      ]);
    } else if (attr.values) {
      for (const value of attr.values) {
        addVariant([...variantBaseName, value].join('-'), [
          `&[${attr.attr}~="${value}"]`,
          `:where([${attr.attr}~="${value}"]) &`,
        ])
      }
    }
  }
}, {
  theme: {
    spacing: {
      ...spacingsMaps,

      'rx-toast-swipe-move-x': 'var(--radix-toast-swipe-move-x)',
      'rx-toast-swipe-move-y': 'var(--radix-toast-swipe-move-y)',
      'rx-toast-swipe-end-x': 'var(--radix-toast-swipe-end-x)',
      'rx-toast-swipe-end-y': 'var(--radix-toast-swipe-end-y)',
    },
    minWidth: {
      ...spacingsMaps,
    },
    maxWidth: {
      ...spacingsMaps,
    },
    minHeight: {
      ...spacingsMaps,
    },
    maxHeight: {
      ...spacingsMaps,
    },
    transformOrigin: {
      'rx-tooltip': 'var(--radix-tooltip-content-transform-origin)',
      'rx-select': 'var(--radix-select-content-transform-origin)',
      'rx-menubar': 'var(--radix-menubar-content-transform-origin)',
      'rx-hover-card': 'var(--radix-hover-card-content-transform-origin)',
      'rx-dropdown-menu': 'var(--radix-dropdown-menu-content-transform-origin)',
      'rx-context-menu': 'var(--radix-context-menu-content-transform-origin)',
    }
  },
});
