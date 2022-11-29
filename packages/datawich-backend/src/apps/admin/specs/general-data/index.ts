import { DataModelSpecs } from './DataModelSpecs'
import { ModelFieldSpecs } from './ModelFieldSpecs'
import { ModelGroupSpecs } from './ModelGroupSpecs'
import { ModelIndexSpecs } from './ModelIndexSpecs'
import { ModelLinksSpecs } from './ModelLinksSpecs'
import { ModelClientSpecs } from './ModelClientSpecs'
import { ModelAuthClientSpecs } from './ModelAuthClientSpecs'
import { ModelMilestoneSpecs } from './ModelMilestoneSpecs'

export const GeneralDataSpecs = [
  ...DataModelSpecs,
  ...ModelFieldSpecs,
  ...ModelGroupSpecs,
  ...ModelIndexSpecs,
  ...ModelLinksSpecs,
  // ...ModelManagementSpecs,
  ...ModelClientSpecs,
  ...ModelAuthClientSpecs,
  ...ModelMilestoneSpecs,
]
