import { DBModelSchema, ModelGenerator } from '@fangcha/generator'
import { DatawichConfig } from '../src/DatawichConfig'

const modelTmpl = `${__dirname}/model.tmpl.ejs`
const extendTmpl = `${__dirname}/class.extends.model.ejs`

const generalDataGenerator = new ModelGenerator({
  dbConfig: DatawichConfig.mysql.datawichDB,
  tmplFile: modelTmpl,
  extTmplFile: extendTmpl,
})

const generalDataSchemas: DBModelSchema[] = [
  {
    tableName: 'data_model',
    outputFile: `${__dirname}/../src/models/auto-build/__DataModel.ts`,
    extFile: `${__dirname}/../src/models/extensions/_DataModel.ts`,
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableBlackList: ['author', 'create_time'],
  },
  {
    tableName: 'model_field',
    outputFile: `${__dirname}/../src/models/auto-build/__ModelField.ts`,
    extFile: `${__dirname}/../src/models/extensions/_ModelField.ts`,
    primaryKey: ['model_key', 'field_key'],
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableBlackList: ['model_key', 'field_key', 'create_time'],
  },
  {
    tableName: 'field_index',
    outputFile: `${__dirname}/../src/models/auto-build/__FieldIndex.ts`,
    extFile: `${__dirname}/../src/models/extensions/_FieldIndex.ts`,
    primaryKey: ['model_key', 'field_key'],
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableBlackList: ['model_key', 'field_key', 'create_time'],
  },
  {
    tableName: 'field_link',
    outputFile: `${__dirname}/../src/models/auto-build/__FieldLink.ts`,
    extFile: `${__dirname}/../src/models/extensions/_FieldLink.ts`,
    primaryKey: 'link_id',
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableBlackList: ['model_key', 'field_key', 'ref_model', 'ref_field'],
  },
  {
    tableName: 'app_client',
    outputFile: `${__dirname}/../src/models/auto-build/__AppClient.ts`,
    extFile: `${__dirname}/../src/models/extensions/_AppClient.ts`,
    primaryKey: 'appid',
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableBlackList: ['appid', 'create_time'],
  },
  {
    tableName: 'model_authorization',
    outputFile: `${__dirname}/../src/models/auto-build/__ModelAuthorization.ts`,
    extFile: `${__dirname}/../src/models/extensions/_ModelAuthorization.ts`,
    primaryKey: ['model_key', 'appid'],
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableBlackList: ['model_key', 'appid', 'create_time'],
  },
  {
    tableName: 'model_group',
    outputFile: `${__dirname}/../src/models/auto-build/__ModelGroup.ts`,
    extFile: `${__dirname}/../src/models/permission/_ModelGroup.ts`,
    primaryKey: ['model_key', 'group_id'],
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableBlackList: ['model_key', 'group_id', 'create_time'],
  },
  {
    tableName: 'common_profile',
    outputFile: `${__dirname}/../src/models/auto-build/__CommonProfile.ts`,
    extFile: `${__dirname}/../src/models/extensions/_CommonProfile.ts`,
    primaryKey: ['user', 'event', 'target'],
    reloadOnAdded: true,
    reloadOnUpdated: true,
    modifiableWhiteList: ['description'],
  },
  {
    tableName: 'model_milestone',
    outputFile: `${__dirname}/../src/models/auto-build/__ModelMilestone.ts`,
    extFile: `${__dirname}/../src/models/extensions/_ModelMilestone.ts`,
    primaryKey: ['model_key', 'tag_name'],
    reloadOnAdded: true,
    modifiableWhiteList: [],
  },
  {
    tableName: 'model_panel',
    outputFile: `${__dirname}/../src/models/auto-build/__ModelPanel.ts`,
    extFile: `${__dirname}/../src/models/extensions/_ModelPanel.ts`,
    reloadOnAdded: true,
    reloadOnUpdated: true,
  },
]

const main = async () => {
  for (const schema of generalDataSchemas) {
    const data = await generalDataGenerator.generateData(schema)
    generalDataGenerator.buildModel(schema, data)
  }
  process.exit()
}
main()
