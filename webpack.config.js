const path = require('path');

module.exports = {
  entry: './src/Code.ts',
  output: {
    filename: 'Code.gs',
    path: path.resolve('clasp-project1')
  }
};
