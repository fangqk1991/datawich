import { Component } from '@fangcha/vue'
import { OssFileInfo } from '@fangcha/oss-models'
import { DataColumnBase, DataColumnExtension } from '../../core'
import { GeneralDataHelper } from '@fangcha/datawich-service'

@Component({
  components: {
    'data-column-extension': DataColumnExtension,
  },
  template: `
    <el-table-column :label="field.name">
      <template slot-scope="scope">
        <a v-if="attachmentEntity(scope.row)" :href="attachmentEntity(scope.row).url" target="_blank"> 点击查看 </a>
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
  `,
})
export class AttachmentDataColumn extends DataColumnBase {
  attachmentEntity(data: any) {
    return data[GeneralDataHelper.entityKey(this.field.dataKey)] as OssFileInfo
  }
}
