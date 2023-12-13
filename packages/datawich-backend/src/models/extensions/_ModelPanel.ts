import __ModelPanel from '../auto-build/__ModelPanel'
import { ModelPanelConfig, ModelPanelInfo } from '@fangcha/datawich-service'

export class _ModelPanel extends __ModelPanel {
  public constructor() {
    super()
  }

  public configData(): ModelPanelConfig {
    let defaultData: ModelPanelConfig = {
      filterItems: [],
      displaySettings: {
        hiddenFieldsMap: {},
        checkedList: [],
        fixedList: [],
      },
    }
    try {
      defaultData = JSON.parse(this.configDataStr) || defaultData
    } catch (e) {}
    return defaultData
  }

  public toJSON() {
    return this.modelForClient()
  }

  public modelForClient() {
    const data = this.fc_pureModel() as ModelPanelInfo
    data.configData = this.configData()
    delete data['configDataStr']
    return data
  }
}
