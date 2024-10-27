// const px2 = require('postcss-px2vwvh');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    // px2({
    //   viewportWidth: 1920,
    //   viewportHeight: 1080,
    //   unitPrecision: 3,
    //   viewportUnit: 'vw',
    //   fontViewportUnit: 'vw',
    //   minPixelValue: 1,
    //   mediaQuery: false,
    //   exclude: [/antd/],
    //   reversePropLis: [
    //     '*height*',
    //     'font-size',
    //     '*top*',
    //     '*bottom*',
    //     'grid-template-rows',
    //   ],
    // }),
    autoprefixer(),
  ],
};
