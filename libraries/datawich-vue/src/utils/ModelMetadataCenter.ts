import { ModelFullMetadata } from '@fangcha/datawich-service'
import { DatawichHTTP } from './DatawichHTTP'

class _ModelMetadataCenter {
  public readonly metadataCache: {
    [modelKey: string]: {
      [tagName: string]: ModelFullMetadata
    }
  } = {}

  public async prepareModelVersions(modelKey: string) {
    return DatawichHTTP.getModelVersionList(modelKey)
  }

  public async prepareVersionMetadata(modelKey: string, version: string) {
    if (!this.metadataCache[modelKey]) {
      this.metadataCache[modelKey] = {}
    }
    if (!this.metadataCache[modelKey][version]) {
      this.metadataCache[modelKey][version] = await DatawichHTTP.getModelTagMetadata(modelKey, version)
    }
    return this.metadataCache[modelKey][version]
  }
}

export const ModelMetadataCenter = new _ModelMetadataCenter()
