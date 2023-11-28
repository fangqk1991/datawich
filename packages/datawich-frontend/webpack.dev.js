const { WebpackBuilder } = require('@fangcha/webpack')

const config = require('fc-config').GlobalAppConfig

module.exports = new WebpackBuilder()
  .setDevMode(true)
  .setPort(config.Datawich.adminPort_frontend)
  .setExtras({
    devServer: {
      client: {
        overlay: false,
      },
      proxy: {
        '/api': `http://localhost:${config.Datawich.adminPort}`,
      },
    },
  })
  .build()
