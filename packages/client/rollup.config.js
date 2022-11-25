import scss from 'rollup-plugin-scss';

export default {
  input: 'dist/Main.js',
  output: {
    file: 'output.js',
    format: 'esm',
    // Removes the hash from the asset filename
    assetFileNames: '[name][extname]',
  },
  plugins: [
    scss(), // will output compiled styles to output.css
  ],
};
