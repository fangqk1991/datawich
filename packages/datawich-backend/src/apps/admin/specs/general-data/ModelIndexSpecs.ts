import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { ModelIndexApis } from '@web/datawich-common/web-api'
import { SessionChecker } from '../../../../services/SessionChecker'
import { checkIndexAbleField } from '@web/datawich-common/models'
import { _FieldIndex } from '../../../../models/extensions/_FieldIndex'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'

const factory = new SpecFactory('数据索引')

factory.prepare(ModelIndexApis.DataModelColumnIndexListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const indexes = await dataModel.getColumnIndexes()
    ctx.body = indexes.map((feed) => feed.fc_pureModel())
  })
})

factory.prepare(ModelIndexApis.DataModelColumnIndexCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    assert.ok(checkIndexAbleField(modelField.fieldType), '此类型不可设置索引')
    let { isUnique } = ctx.request.body
    assert.ok([0, 1].includes(isUnique), 'isUnique 参数不合法')
    await _FieldIndex.createIndex(modelField, isUnique)
    ctx.status = 200
  })
})

factory.prepare(ModelIndexApis.DataModelColumnIndexDrop, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const fieldIndex = await _FieldIndex.findIndex(modelField.modelKey, modelField.fieldKey)
    assert.ok(!!fieldIndex, '索引不存在')
    await fieldIndex.dropIndex()
    ctx.status = 200
  })
})

export const ModelIndexSpecs = factory.buildSpecs()
