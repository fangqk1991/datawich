const { WebpackBuilder } = require('@fangcha/webpack')
const config = require('fc-config').GlobalAppConfig

module.exports = new WebpackBuilder()
  .useReact()
  .setDevMode(true)
  .setPort(config.Datawich.adminPort_frontend2)
  .setEntry('./src/index.tsx')
  .setExtras({
    devServer: {
      proxy: {
        '/api': `http://localhost:${config.Datawich.adminPort}`,
      },
    },
  })
  .build()
