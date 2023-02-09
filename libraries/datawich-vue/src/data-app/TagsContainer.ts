import { Component, Prop, ViewController } from '@fangcha/vue'
import { SelectOption } from '@fangcha/tools'

@Component({
  template: `
    <div class="p-1 mb-1" style="display: inline-block; vertical-align: middle; border: 1px solid #e0e5e8;">
      <div v-for="item in options" :key="item.value">
        <el-tag v-if="(value & (1 << item.value)) > 0" class="adaptive-tag">{{ item.label }}</el-tag>
      </div>
    </div>
  `,
})
export class TagsContainer extends ViewController {
  @Prop({ default: () => [], type: Array }) readonly options!: SelectOption[]
  @Prop({ default: 0, type: Number }) readonly value!: number
}
