import { Component } from 'vue-property-decorator'
import { SimpleInputDialog, TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { CommonGroupApis } from '@fangcha/datawich-service/lib/common/web-api'
import { SelectOption } from '@fangcha/tools'
import {
  CommonGroupModel,
  CommonPermissionModel,
  ScopeParams,
  ScopeProfile,
} from '@fangcha/general-group/lib/common/models'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
  },
  template: `
    <typical-dialog-view
      ref="my-dialog"
      class="my-theme"
      :title="title"
      width="60%"
      custom-class="mt-5"
      :show-footer="!readonly"
      :callback="callback"
    >
      <template v-if="!readonly">
        <div class="mb-2">
          <el-button type="primary" size="mini" @click="onAddScope">添加范围</el-button>
        </div>
        <hr />
      </template>
      <el-table v-loading="isLoading" size="mini" stripe border :data="scopeList">
        <el-table-column prop="scope" width="160px">
          <template v-slot:header>
            <span>{{ scopeText}}</span>
            <el-tooltip class="item" effect="dark" placement="bottom">
              <span class="el-icon-question" />
              <div slot="content">{{ scopeHint }}</div>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            {{ scope.row.scope }}
          </template>
        </el-table-column>
        <el-table-column label="权限">
          <template slot-scope="scope">
            <div v-if="checkedMap[scope.row.scope]" v-for="option in focusOptions" :key="option.value" style="display:inline-block" class="mr-4">
              <el-checkbox v-model="checkedMap[scope.row.scope][option.value]" :disabled="readonly">
                {{ option.label }}
              </el-checkbox>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </typical-dialog-view>
  `,
})
export class GroupPermissionDialog extends TypicalDialog {
  scopeText: string = '范围'
  scopeHint: string = '* 表示所有范围'
  group!: CommonGroupModel
  readonly: boolean = false
  scopeList: ScopeProfile[] = []
  focusOptions: SelectOption[] = []
  checkedMap: any = {}

  constructor() {
    super()
  }

  static editDialog(group: CommonGroupModel, focusOptions: SelectOption[], readonly: boolean = false) {
    const dialog = new GroupPermissionDialog()
    dialog.title = `权限管理 [${group.name || group.groupId}]`
    dialog.group = group
    dialog.focusOptions = focusOptions
    dialog.readonly = readonly
    return dialog
  }

  viewDidLoad() {
    this.loadPermissions()
  }

  async loadPermissions() {
    await this.execHandler(async () => {
      const request = MyAxios(new CommonAPI(CommonGroupApis.GroupPermissionListGet, this.group.groupId))
      const permissions = (await request.quickSend()) as CommonPermissionModel[]

      const scopeMap: any = {}
      const scopeList: ScopeProfile[] = []
      for (const item of permissions) {
        if (!scopeMap[item.scope]) {
          const arr: CommonPermissionModel[] = []
          scopeMap[item.scope] = arr
          scopeList.push({
            scope: item.scope,
            permissions: arr,
          })
        }
        scopeMap[item.scope].push(item)
      }
      scopeList.forEach((scopeObj) => {
        this.syncScopeToCheckedMap(scopeObj)
      })
      this.scopeList = scopeList
    })
  }

  syncScopeToCheckedMap(scopeObj: ScopeProfile) {
    this.$set(this.checkedMap, scopeObj.scope, {})
    this.focusOptions.forEach((option) => {
      this.$set(this.checkedMap[scopeObj.scope], option.value, false)
    })
    scopeObj.permissions.forEach((permission) => {
      this.checkedMap[scopeObj.scope][permission.permission] = true
    })
  }

  onAddScope() {
    const dialog = new SimpleInputDialog()
    dialog.title = '请输入范围'
    dialog.placeholder = this.scopeHint
    dialog.show(async (scope: string) => {
      scope = scope.trim()
      if (scope in this.checkedMap) {
        return
      }
      const scopeObj: ScopeProfile = {
        scope: scope,
        permissions: [],
      }
      this.scopeList.push(scopeObj)
      this.syncScopeToCheckedMap(scopeObj)
    })
  }

  onHandleResult() {
    const result: ScopeParams = {}
    this.scopeList.forEach((scopeObj) => {
      const checkedMap = this.checkedMap[scopeObj.scope]
      const keys = this.focusOptions.filter((option) => checkedMap[option.value]).map((item) => item.value as string)
      if (keys.length > 0) {
        result[scopeObj.scope] = keys
      }
    })
    return result
  }
}
