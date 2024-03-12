export const OpenOssApis = {
  OssResourcePrepare: {
    method: 'POST',
    route: '/api/open/v1/oss/resource-metadata',
    description: '准备 OSS 上传需要的相关信息',
  },
  OssResourceStatusMark: {
    method: 'PUT',
    route: '/api/open/v1/oss/resource/:resourceId',
    description: '标记 OSS 资源已上传',
  },
}
