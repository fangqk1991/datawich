import { CommonGroupApis } from '@fangcha/datawich-service/lib/common/web-api'
import { Component, ConfirmDialog, Prop, SimpleInputDialog, SimplePickerDialog, ViewController } from '@fangcha/vue'
import { Watch } from 'vue-property-decorator'
import { CommonMemberModel } from '@fangcha/general-group/lib/common/models'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  template: `
    <div v-loading="isLoading">
      <template v-if="!readonly">
        <div class="mb-2">
          <el-button type="primary" size="mini" @click="onAddMember">添加成员</el-button>
        </div>
        <hr />
      </template>
      <div class="mb-4" style="line-height: 2">
        <el-tag
          v-for="member in memberList"
          :key="member.member"
          :type="getTagType(member)"
          size="small"
          :closable="!readonly"
          @click="onUpdateMember(member)"
          @close="onRemoveMember(member)"
          class="mr-2"
        >
          {{ member.member }}
        </el-tag>
      </div>
    </div>
  `,
})
export class GroupMemberPanel extends ViewController {
  @Prop({ default: '成员信息', type: String }) readonly title!: string
  @Prop({ default: '', type: String }) readonly groupId!: string
  @Prop({ default: false, type: Boolean }) readonly readonly!: boolean
  memberList: any[] = []

  viewDidLoad() {
    this.reloadMembers()
  }

  @Watch('groupId')
  onValueChanged() {
    this.reloadMembers()
  }

  async reloadMembers() {
    if (!this.groupId) {
      this.memberList = []
      return
    }
    await this.execHandler(async () => {
      const request = MyAxios(new CommonAPI(CommonGroupApis.GroupMemberListGet, this.groupId))
      this.memberList = await request.quickSend()
    })
  }

  getTagType(member: CommonMemberModel) {
    if (member.isAdmin) {
      return 'danger'
    }
    return ''
  }

  onAddMember() {
    const dialog = SimpleInputDialog.textInputDialog()
    dialog.show(async (email) => {
      const request = MyAxios(new CommonAPI(CommonGroupApis.GroupMemberAdd, this.groupId))
      request.setBodyData({ emailList: [email] })
      await request.execute()
      this.$message.success(`添加成功`)
      this.reloadMembers()
    })
  }

  onUpdateMember(member: CommonMemberModel) {
    if (this.readonly) {
      return
    }
    const dialog = SimplePickerDialog.dialogForTinyInt('是否管理员')
    dialog.curValue = member.isAdmin
    dialog.show(async (isAdmin: number) => {
      const request = MyAxios(new CommonAPI(CommonGroupApis.GroupMemberUpdate, this.groupId, member.member))
      request.setBodyData({
        isAdmin: isAdmin,
      })
      await request.execute()
      this.$message.success('更新成功')
      this.reloadMembers()
    })
  }

  onRemoveMember(member: CommonMemberModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '移除成员'
    dialog.content = `确定要移除 "${member.member}" 吗？`
    dialog.show(async () => {
      const request = MyAxios(new CommonAPI(CommonGroupApis.GroupMemberRemove, this.groupId, member.member))
      await request.execute()
      this.$message.success('移除成功')
      this.reloadMembers()
    })
  }
}
