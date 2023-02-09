import { FieldLinkModel } from './FieldLinkModel'
import { Keys_Raw_FieldLink, Raw_FieldLink } from './ModelFieldTypes'

export class FieldLinkMaker {
  public readonly rawLink: Raw_FieldLink
  private _linkModel!: FieldLinkModel

  constructor(rawLink: Raw_FieldLink) {
    this.rawLink = rawLink
  }

  public getLinkModel(): FieldLinkModel {
    if (!this._linkModel) {
      const rawData: any = {}
      Keys_Raw_FieldLink.forEach((key) => {
        rawData[key] = this.rawLink[key]
      })
      const extrasData = (() => {
        let data: { [p: string]: any } = {}
        try {
          data = JSON.parse(rawData.extrasInfo) || {}
        } catch (e) {}
        return data
      })()
      const result = { ...rawData } as FieldLinkModel
      result.referenceCheckedInfos = extrasData['referenceCheckedInfos'] || []
      result.referenceFields = []
      // @ts-ignore
      delete result.extrasInfo
      this._linkModel = result
    }
    return this._linkModel
  }
}
