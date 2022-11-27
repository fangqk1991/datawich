import __ModelFieldAction from '../auto-build/__ModelFieldAction'
import { ActionEvent } from '@web/datawich-common/models'

export class _ModelFieldAction extends __ModelFieldAction {
  public constructor() {
    super()
  }

  public derivativeInfo() {
    if (this.event === ActionEvent.DerivativeInfo) {
      try {
        return JSON.parse(this.content) || {}
      } catch (e) {}
    }
    return {}
  }
}
