/**
 * @description 此文件会在持续集成环境中被覆盖为含有 accessKeyId / accessKeySecret 信息的文件
 */
module.exports = {
  visitor: {
    endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    region: 'oss-cn-hangzhou',
    accessKeyId: '<Some accessKeyId>',
    accessKeySecret: '<Some accessKeySecret>',
    bucket: 'fc-cdn',
    secure: true,
  },
  uploader: {
    endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    region: 'oss-cn-hangzhou',
    accessKeyId: '<Some accessKeyId>',
    accessKeySecret: '<Some accessKeySecret>',
    bucket: 'fc-cdn',
    secure: true,
    timeout: 60 * 1000,
  },
}
