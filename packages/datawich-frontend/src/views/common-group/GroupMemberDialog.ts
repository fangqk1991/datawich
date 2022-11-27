import { Component, CustomDialog, CustomDialogView } from '@fangcha/vue'
import { GroupMemberPanel } from './GroupMemberPanel'
import { CommonGroupModel } from '@fangcha/general-group/lib/common/models'

@Component({
  components: {
    'custom-dialog-view': CustomDialogView,
    'group-member-panel': GroupMemberPanel,
  },
  template: `
    <custom-dialog-view ref="my-dialog" :title="title" width="60%">
      <group-member-panel :group-id="groupId" :readonly="readonly" />
    </custom-dialog-view>
  `,
})
export class GroupMemberDialog extends CustomDialog {
  title = '成员管理'
  groupId!: string
  readonly = false

  constructor() {
    super()
  }

  static showMembers(group: CommonGroupModel, readonly = false) {
    const dialog = new GroupMemberDialog()
    dialog.groupId = group.groupId
    dialog.title = `成员管理 [${group.name || group.groupId}]`
    dialog.readonly = readonly
    dialog.show()
  }
}
