import { Component } from '@fangcha/vue'
import EnumFieldExtensionBase from './EnumFieldExtensionBase'
import { FieldType } from '@fangcha/datawich-service/lib/common/models'

@Component({
  template: `
    <div class="mx-4">
      <p v-if="!isMultiEnum">
        <b class="text-danger">用数字表示的「标签」类型已经不被推荐，推荐使用表达范围更广、可读性更强的「多选枚举」</b>
      </p>
      <el-table
        :data="data.options"
        size="mini"
        border
        :header-cell-style="{ 'background-color': '#fafafa' }"
      >
        <template slot="empty">
          <el-button style="color: #4E5BBD; border-color: #4E5BBD;" size="mini" @click="addEnumOption">
            {{ LS('Add') }}
          </el-button>
        </template>
        <el-table-column label="枚举值">
          <template slot-scope="scope">
            <el-input v-model="scope.row.value" size="small" :disabled="scope.row.already" />
          </template>
        </el-table-column>
        <el-table-column label="枚举名称">
          <template slot-scope="scope">
            <el-input v-model="scope.row.label" size="small" />
          </template>
        </el-table-column>
        <el-table-column width="120px" align="center">
          <template slot="header">
            <span>{{ LS('Action') }}</span>
          </template>
          <template slot-scope="scope">
            <el-button class="el-icon-plus action-icon" @click="addEnumOption(scope.$index)" />
            <el-button
              class="el-icon-delete action-icon"
              @click="removeEnumOption(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  `,
})
export default class TagsFieldExtension extends EnumFieldExtensionBase {
  get isMultiEnum() {
    return this.data.fieldType === FieldType.MultiEnum
  }
}
