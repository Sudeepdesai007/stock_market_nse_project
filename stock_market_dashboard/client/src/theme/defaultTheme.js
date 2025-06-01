export const defaultTheme = {
  // Radii
  '--radius-sm': '4px',
  '--radius-md': '8px',
  '--radius-lg': '12px',

  // Background Colors
  '--color-bg-body': '#23272A',
  '--color-bg-header': '#2C2F33',
  '--color-bg-card': '#36393F',
  '--color-bg-grid-item': '#40444B',
  '--color-bg-input': '#36393F',
  '--color-bg-table-stripe': '#3A3D42',
  '--color-bg-table-row-hover': '#454950',
  '--color-bg-metric-item-hover': '#3C3F44',
  '--color-bg-tooltip': '#2C2F33',

  // Text Colors
  '--color-text-primary': '#DCDDDE',
  '--color-text-secondary': '#B9BBBE',
  '--color-text-muted': '#8A8F94',
  '--color-text-muted-alt': '#99AAB5',
  '--color-text-white': '#FFFFFF',

  // Accent Colors
  '--color-accent-primary': '#5865F2', // rgb(88, 101, 242)
  '--color-accent-primary-darker': '#4752C4',
  '--color-accent-primary-darkest': '#3F4AB2',
  '--color-accent-light': '#7289DA',

  // Border Colors
  '--color-border-subtle': '#4F545C',

  // Semantic Colors
  '--color-positive': '#28a745',
  '--color-negative': '#dc3545',
  '--color-warning': '#ffc107',

  // Alpha Colors
  '--color-accent-primary-alpha-20': 'rgba(88, 101, 242, 0.2)',
  '--color-accent-primary-alpha-25': 'rgba(88, 101, 242, 0.25)',
  '--color-accent-primary-alpha-30': 'rgba(88, 101, 242, 0.3)',
  '--color-accent-primary-alpha-35': 'rgba(88, 101, 242, 0.35)',
  '--color-bg-sticky-form-alpha-85': 'rgba(44, 47, 51, 0.85)',
  '--color-bg-sticky-form-alpha-90': 'rgba(44, 47, 51, 0.92)',

  // Box Shadows
  '--shadow-card-base': '0 3px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
  '--shadow-card-hover': '0 6px 12px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)',
  '--shadow-sticky-form': '0 6px 12px rgba(0,0,0,0.3)',
  '--shadow-sticky-form-softer': '0 4px 8px rgba(0,0,0,0.2)',
  '--shadow-input-focus': '0 0 0 3px var(--color-accent-primary-alpha-30)',
  '--shadow-button-focus': '0 0 0 4px var(--color-accent-primary-alpha-35)',
  '--shadow-panel-focus': '0 0 0 4px var(--color-accent-primary-alpha-20)',
  '--shadow-form-focus-within': '0 0 15px var(--color-accent-primary-alpha-25)',
  '--shadow-tooltip': '0 5px 15px rgba(0,0,0,0.3)',
  '--shadow-scroll-to-top': '0 4px 10px rgba(0, 0, 0, 0.25)',
  '--shadow-welcome-card': '0 8px 25px rgba(0,0,0,0.25)',
  '--shadow-raw-data': '0 5px 15px rgba(0,0,0,0.2)',
  '--shadow-grid-item': '0 3px 10px rgba(0,0,0,0.15)',
  '--shadow-fetch-button-hover': '0 4px 8px rgba(0,0,0,0.2)',
  '--shadow-fetch-button-active': '0 2px 4px rgba(0,0,0,0.15)',
  '--shadow-metric-item-hover': '0 4px 8px rgba(0,0,0,0.2)',

  // Typography
  '--font-family-primary': '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  '--font-family-monospace': '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  
  '--font-weight-light': '300',
  '--font-weight-normal': '400',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--font-weight-bold': '700',

  '--font-size-xs': '0.75rem',  // 12px
  '--font-size-sm': '0.875rem', // 14px
  '--font-size-base': '1rem',    // 16px
  '--font-size-md': '1.125rem', // 18px
  '--font-size-lg': '1.25rem',  // 20px
  '--font-size-xl': '1.5rem',   // 24px
  '--font-size-2xl': '1.875rem',// 30px
  '--font-size-3xl': '2.25rem', // 36px
  '--font-size-4xl': '3rem',    // 48px

  '--line-height-tight': '1.25',
  '--line-height-normal': '1.5',
  '--line-height-relaxed': '1.75',

  // Spacing (based on an 8px grid, can be adjusted)
  '--spacing-unit': '8px',
  '--spacing-xs': 'calc(0.5 * var(--spacing-unit))',    // 4px
  '--spacing-sm': 'var(--spacing-unit)',               // 8px
  '--spacing-md': 'calc(1.5 * var(--spacing-unit))',  // 12px
  '--spacing-lg': 'calc(2 * var(--spacing-unit))',    // 16px
  '--spacing-xl': 'calc(3 * var(--spacing-unit))',    // 24px
  '--spacing-2xl': 'calc(4 * var(--spacing-unit))',   // 32px
  '--spacing-3xl': 'calc(5 * var(--spacing-unit))',   // 40px
  '--spacing-4xl': 'calc(6 * var(--spacing-unit))',   // 48px
  
  // Borders (extending existing)
  '--border-width-thin': '1px',
  '--border-width-medium': '2px',
  '--border-width-thick': '3px',
  '--color-border-default': 'var(--color-border-subtle)',
  '--color-border-accent': 'var(--color-accent-primary)',

  // You can add other theme properties here like font families, spacings, etc.
  // For example:
  // '--font-family-primary': '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  // '--spacing-unit': '8px',
}; 