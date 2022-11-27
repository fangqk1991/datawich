import __ModelNotifyTemplate from '../auto-build/__ModelNotifyTemplate'
import { TemplateHelper } from '@fangcha/tools'

export class _ModelNotifyTemplate extends __ModelNotifyTemplate {
  public constructor() {
    super()
  }

  public async makeContent(data: { [p: string]: any }) {
    return TemplateHelper.renderTmpl(this.content, data)
  }
}
