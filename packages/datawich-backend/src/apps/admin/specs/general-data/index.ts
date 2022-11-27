import { DataModelSpecs } from './DataModelSpecs'
import { ModelFieldSpecs } from './ModelFieldSpecs'
import { ModelGroupSpecs } from './ModelGroupSpecs'
import { ModelIndexSpecs } from './ModelIndexSpecs'
import { ModelLinksSpecs } from './ModelLinksSpecs'
import { FieldGroupSpecs } from './FieldGroupSpecs'
import { ModelClientSpecs } from './ModelClientSpecs'
import { ModelAuthClientSpecs } from './ModelAuthClientSpecs'
import { ModelDisplayColumnSpecs } from './ModelDisplayColumnSpecs'
import { ModelMilestoneSpecs } from './ModelMilestoneSpecs'

export const GeneralDataSpecs = [
  ...DataModelSpecs,
  ...ModelFieldSpecs,
  ...ModelGroupSpecs,
  ...ModelIndexSpecs,
  ...ModelLinksSpecs,
  ...FieldGroupSpecs,
  // ...ModelManagementSpecs,
  ...ModelClientSpecs,
  ...ModelAuthClientSpecs,
  ...ModelDisplayColumnSpecs,
  ...ModelMilestoneSpecs,
]
