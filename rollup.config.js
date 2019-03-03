export default {
  input: 'wrapper.js',
  output: {
    file: 'dist/phaser-tiled-json-external-loader.js',
    globals: {
      phaser: 'Phaser',
    },
    format: 'iife',
  },
  external: ['phaser'],
};
