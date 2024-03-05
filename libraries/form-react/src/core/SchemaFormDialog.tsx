import React, { useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { CommonForm } from './CommonForm'
import { FormField, FormSchemaHelper } from '@fangcha/form-models'

interface Props extends DialogProps {
  fields: FormField[]
  data?: any
}

export class SchemaFormDialog extends ReactDialog<Props> {
  width = '95%'
  title = 'Editor'

  public constructor(props: Omit<Props, 'context'>) {
    super(props)
  }

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const fields = props.fields

      let data = props.data
      if (!data) {
        data = {}
        for (const field of fields.filter((item) => item.extrasData.defaultValue)) {
          if (field.extrasData.fullKeys) {
            FormSchemaHelper.setDeepValue(data, field.extrasData.fullKeys, field.extrasData.defaultValue)
          } else {
            data[field.fieldKey] = field.extrasData.defaultValue
          }
        }
      }
      const formRef = useRef({
        exportResult: () => null,
      })

      props.context.handleResult = async () => {
        return await formRef.current.exportResult()
      }
      return <CommonForm ref={formRef} allFields={fields} myData={data} />
    }
  }
}
