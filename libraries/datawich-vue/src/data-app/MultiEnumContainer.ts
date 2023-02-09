import { Component, Prop, ViewController } from '@fangcha/vue'
import { SelectOption } from '@fangcha/tools'
import { GeneralDataHelper } from '@fangcha/datawich-service'

@Component({
  template: `
    <div class="p-1 mb-1" style="display: inline-block; vertical-align: middle; border: 1px solid #e0e5e8;">
      <div v-for="option in pickedOptions">
        <el-tag class="adaptive-tag">{{ option.label }}</el-tag>
      </div>
    </div>
  `,
})
export class MultiEnumContainer extends ViewController {
  @Prop({ default: () => [], type: Array }) readonly options!: SelectOption[]
  @Prop({ default: '', type: String }) readonly value!: string

  get pickedOptions() {
    const checkedMap = GeneralDataHelper.extractMultiEnumCheckedMapForValue(this.value, this.options)
    return this.options.filter((option) => checkedMap[option.value])
  }
}
