import __ModelPanel from '../auto-build/__ModelPanel'
import { ModelPanelConfig, ModelPanelInfo, ModelPanelParams } from '@fangcha/datawich-service'
import assert from '@fangcha/assert'

export class _ModelPanel extends __ModelPanel {
  public constructor() {
    super()
  }

  public configData(): ModelPanelConfig {
    let defaultData: ModelPanelConfig = {
      queryParams: {},
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

  public async updateInfos(params: ModelPanelParams) {
    assert.ok(!!params.name, '名称不能为空')
    assert.ok(!!params.configData, 'configData 不能为空')
    assert.ok(!!params.configData.displaySettings, 'configData.displaySettings 有误')
    params.configData.queryParams = params.configData.queryParams || {}

    this.fc_edit()
    this.name = params.name
    this.configDataStr = JSON.stringify(params.configData)
    await this.updateToDB()
  }
}
