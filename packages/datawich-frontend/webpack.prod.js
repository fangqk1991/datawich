const { WebpackBuilder } = require('@fangcha/webpack')

module.exports = new WebpackBuilder()
  .setDevMode(false)
  .setPublicPath('/')
  // .setExtras({
  //   optimization: {
  //     minimize: false,
  //   },
  // })
  .build()
