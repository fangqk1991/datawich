import React, { useMemo, useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { CoreField, DBTable } from '@fangcha/datawich-service'
import { DataNormalForm } from './DataNormalForm'

interface Props extends DialogProps {
  table: DBTable
  data?: any
}

export class DBTableRecordDialog extends ReactDialog<Props> {
  width = '80%'
  title = '数据记录'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const table = props.table

      const fields = useMemo(() => {
        return table.fields
          .filter((item) => item.insertable)
          .map((schemaField): CoreField => {
            return {
              fieldKey: schemaField.fieldKey,
              fieldType: schemaField.fieldType,
              name: schemaField.name,
              required: schemaField.nullable ? 0 : 1,
              extrasData: {} as any,
              defaultValue: schemaField.defaultValue,
            }
          })
      }, [table])

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
