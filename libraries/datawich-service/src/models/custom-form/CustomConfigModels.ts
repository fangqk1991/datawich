export interface CustomConfigParams {
  modelKey: string
  metadataVersion: string
}

export interface FlexConfigParams extends CustomConfigParams {
  modelKey: string
  metadataVersion: string
  name: string
  configData: {
    [p: string]: string | number
  }
}

export interface FlexConfigModel extends FlexConfigParams {
  configId: string
}
