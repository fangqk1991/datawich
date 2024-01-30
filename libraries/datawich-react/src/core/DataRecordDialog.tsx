import React, { useMemo, useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { DataNormalForm } from './DataNormalForm'

interface Props extends DialogProps {
  mainFields: ModelFieldModel[]
  modelKey: string
  data?: any
}

export class DataRecordDialog extends ReactDialog<Props> {
  width = '80%'
  title = '数据记录'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      let data = props.data
      if (!data) {
        data = {}
        for (const field of props.mainFields.filter((item) => item.useDefault)) {
          data[field.dataKey] = field.defaultValue
        }
      }

      const writeableFields = useMemo(() => {
        return props.mainFields.filter((field) => !field.isSystem)
      }, [props.mainFields])

      const formRef = useRef({
        exportResult: () => null,
      })

      props.context.handleResult = async () => {
        return await formRef.current.exportResult()
      }
      return <DataNormalForm ref={formRef} allFields={writeableFields} myData={data} />
    }
  }
}
