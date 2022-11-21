const { makeRunningConfig } = require('fc-config/config.utils')
const path = require('path')
const rootDir = path.resolve(__dirname, '../..')

const appList = [
  {
    name: 'datawich-admin',
    script: `${rootDir}/packages/datawich-backend/dist/datawich-admin.js`,
    error_file: '/data/logs/datawich/datawich-admin-err.log',
    out_file: '/data/logs/datawich/datawich-admin-out.log',
    exec_mode: 'fork',
    listen_timeout: 10000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
    env: {
      CODE_VERSION: 'COMMIT_SHA',
      NODE_ENV: 'development',
      NODE_CONFIG_ENV: 'development',
    },
    env_staging: {
      NODE_ENV: 'staging',
      NODE_CONFIG_ENV: 'staging',
    },
    env_production: {
      NODE_ENV: 'production',
      NODE_CONFIG_ENV: 'production',
    },
  },
  {
    name: 'datawich-open',
    script: `${rootDir}/packages/datawich-backend/dist/datawich-open.js`,
    error_file: '/data/logs/datawich/datawich-open-err.log',
    out_file: '/data/logs/datawich/datawich-open-out.log',
    exec_mode: 'fork',
    listen_timeout: 10000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
    env: {
      CODE_VERSION: 'COMMIT_SHA',
      NODE_ENV: 'development',
      NODE_CONFIG_ENV: 'development',
    },
    env_staging: {
      NODE_ENV: 'staging',
      NODE_CONFIG_ENV: 'staging',
    },
    env_production: {
      NODE_ENV: 'production',
      NODE_CONFIG_ENV: 'production',
    },
  },
]

const resqueApp = {
  name: 'datawich-resque',
  script: `${rootDir}/packages/datawich-backend/dist/datawich-resque.js`,
  error_file: '/data/logs/datawich/datawich-resque-err.log',
  out_file: '/data/logs/datawich/datawich-resque-out.log',
  exec_mode: 'fork',
  listen_timeout: 10000,
  log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
  env: {
    CODE_VERSION: 'COMMIT_SHA',
    NODE_ENV: 'development',
    NODE_CONFIG_ENV: 'development',
  },
  env_staging: {
    NODE_ENV: 'staging',
    NODE_CONFIG_ENV: 'staging',
  },
  env_production: {
    NODE_ENV: 'production',
    NODE_CONFIG_ENV: 'production',
  },
}

const config = makeRunningConfig()
if (!config.Tags.includes('Backup')) {
  if (config.Datawich.useResque) {
    appList.push(resqueApp)
  }
}

module.exports = {
  apps: appList,
}
