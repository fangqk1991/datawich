const envData = process.env || {}

module.exports = {
  Datawich: {
    configVersion: envData.configVersion,
    wecomBotKey: envData.wecomBotKey,
    adminPort_frontend: 3299,
    adminBaseURL: envData.adminBaseURL,
    adminPort: 3300,
    adminJwtSecret: envData.adminJwtSecret,
    openPort: 3200,
    openBaseURL: envData.openBaseURL,
    adminSSO: {
      baseURL: envData.adminSSO_baseURL,
      clientId: envData.adminSSO_clientId,
      clientSecret: envData.adminSSO_clientSecret,
      authorizePath: envData.adminSSO_authorizePath,
      tokenPath: envData.adminSSO_tokenPath,
      logoutPath: envData.adminSSO_logoutPath,
      scope: envData.adminSSO_scope,
      callbackUri: envData.adminSSO_callbackUri,
      userInfoURL: envData.adminSSO_userInfoURL,
    },
    mysql: {
      datawichDB: {
        host: envData.DB_Host,
        port: envData.DB_Port,
        dialect: 'mysql',
        database: envData.DB_Name,
        username: envData.DB_User,
        password: envData.DB_Password,
      },
    },
    useResque: envData.useResque,
    useSchedule: envData.useSchedule,
    datawichResque: {
      redisHost: envData.Redis_Host,
      redisPort: envData.Redis_Port,
    },
    frontendConfig: {
      ossParams: {
        defaultBucketName: envData.AliOSS_bucket,
        defaultOssZone: envData.oss_remoteRootDir,
      },
    },
    datawichDownloadDir: envData.datawichDownloadDir,
    ossOptions: {
      Default: {
        visitor: {
          region: envData.AliOSS_region,
          accessKeyId: envData.AliOSS_accessKeyId,
          accessKeySecret: envData.AliOSS_accessKeySecret,
          bucket: envData.AliOSS_bucket,
          secure: true,
        },
        uploader: {
          region: envData.AliOSS_region,
          accessKeyId: envData.AliOSS_accessKeyId,
          accessKeySecret: envData.AliOSS_accessKeySecret,
          bucket: envData.AliOSS_bucket,
          secure: true,
        },
        uploadSignature: {
          accessKeyId: envData.AliOSS_accessKeyId,
          accessKeySecret: envData.AliOSS_accessKeySecret,
          bucketURL: envData.AliOSS_bucketURL,
          timeout: 3000,
        },
        remoteRootDir: envData.oss_remoteRootDir,
        downloadRootDir: envData.oss_downloadRootDir,
      },
    },
  },
}
