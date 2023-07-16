import React, { useMemo, useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { DataNormalForm } from '../core/DataNormalForm'

interface Props extends DialogProps {
  mainFields: ModelFieldModel[]
  modelKey: string
  data?: any
}

export class GeneralDataDialog extends ReactDialog<Props> {
  title = '数据记录'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      let data = props.data || {}
      for (const field of props.mainFields.filter((item) => item.useDefault)) {
        data[field.dataKey] = field.defaultValue
      }
      data = JSON.parse(JSON.stringify(data))

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
