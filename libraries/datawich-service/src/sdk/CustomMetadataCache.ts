import { DatawichProxy } from './DatawichProxy'
import { CustomConfigParams, ModelFullMetadata } from '../common/models'

export class CustomMetadataCache {
  public readonly cache: {
    [modelKey: string]: {
      [tagName: string]: ModelFullMetadata
    }
  } = {}
  public readonly datawichProxy: DatawichProxy

  constructor(datawichProxy: DatawichProxy) {
    this.datawichProxy = datawichProxy
    this.cache = {}
  }

  public async prepareConfigMetadata(data: CustomConfigParams) {
    if (!this.cache[data.modelKey]) {
      this.cache[data.modelKey] = {}
    }
    if (!this.cache[data.modelKey][data.metadataVersion]) {
      this.cache[data.modelKey][data.metadataVersion] = await this.datawichProxy.getGeneralDataModelTagMetadata(
        data.modelKey,
        data.metadataVersion
      )
    }
    return this.cache[data.modelKey][data.metadataVersion]
  }
}
