import React, { useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { CommonForm } from './CommonForm'
import { FormSchema } from '@fangcha/form-models'

interface Props extends DialogProps {
  schema: FormSchema
  data?: any
}

export class SchemaFormDialog extends ReactDialog<Props> {
  width = '95%'
  title = '修改'

  public constructor(props: Omit<Props, 'context'>) {
    super(props)
    this.title = props.title || props.schema.name || (props.data ? '添加' : '修改')
  }

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const fields = props.schema.fields
      let data = props.data
      if (!data) {
        data = {}
        for (const field of fields.filter((item) => item.extrasData.defaultValue)) {
          data[field.fieldKey] = field.extrasData.defaultValue
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
