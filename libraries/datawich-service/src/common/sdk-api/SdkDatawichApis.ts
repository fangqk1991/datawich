import { OpenDataModelApis } from '../open-api'
import { Api } from '@fangcha/swagger'

export const SdkDatawichApis = {
  ...OpenDataModelApis,
}

for (const key of Object.keys(SdkDatawichApis)) {
  const apiOptions = SdkDatawichApis[key] as Api
  SdkDatawichApis[key] = {
    ...apiOptions,
    route: apiOptions.route.replace(/^\/api\//, '/api/datawich-sdk/'),
  }
}

export const SdkDatawichApis2 = {
  SystemInfoGet: {
    method: 'GET',
    route: '/api/datawich-sdk/general-data/v1/system-info',
    description: '获取系统信息',
  } as Api,
  OssUrlsSignature: {
    method: 'POST',
    route: '/api/datawich-sdk/general-data/v1/oss-url-signature',
    description: '获取签名链接',
    parameters: [
      {
        name: 'bodyData',
        type: 'object',
        in: 'body',
        schema: {
          type: 'object',
          properties: {
            ossKeys: {
              type: 'array',
              items: {
                type: 'string',
                example: 'xxxx',
              },
            },
          },
        },
      },
    ],
  } as Api,
}
