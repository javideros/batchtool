/**
 * JSDoc configuration for JSR-352 Batch Tool
 * Generates comprehensive API documentation
 */
module.exports = {
  source: {
    include: ['./src/'],
    includePattern: '\\.(js|jsx|ts|tsx)$',
    exclude: ['node_modules/', 'dist/', 'coverage/', 'src/test/']
  },
  opts: {
    destination: './docs/api/',
    recurse: true
  },
  plugins: [
    'plugins/markdown',
    'node_modules/jsdoc-plugin-typescript'
  ],
  templates: {
    cleverLinks: false,
    monospaceLinks: false
  },
  markdown: {
    parser: 'gfm'
  }
};