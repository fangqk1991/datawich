import React, { useMemo, useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { CoreField, FlexSchema } from '@fangcha/datawich-service'
import { DataNormalForm } from './DataNormalForm'

interface Props extends DialogProps {
  schema: FlexSchema
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
      const fields = useMemo(() => {
        return props.schema.fields.map(
          (item): CoreField => ({
            fieldKey: item.fieldKey,
            fieldType: item.fieldType,
            name: item.name || item.fieldKey,
            required: item.required || 0,
            extrasData: item.extrasData || ({} as any),
            defaultValue: item.defaultValue,
            options: item.options || [],
            value2LabelMap: (item.options || []).reduce((result: any, cur: any) => {
              result[cur.value] = cur.label
              return result
            }, {}),
            hidden: false,
          })
        )
      }, [props.schema])

      let data = props.data
      if (!data) {
        data = {}
        for (const field of fields.filter((item) => item.defaultValue)) {
          data[field.fieldKey] = field.defaultValue
        }
      }

      const formRef = useRef({
        exportResult: () => null,
      })

      props.context.handleResult = async () => {
        return await formRef.current.exportResult()
      }
      return <DataNormalForm ref={formRef} allFields={fields} myData={data} />
    }
  }
}
