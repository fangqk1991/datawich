import React, { useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { CommonForm, CommonFormProps } from './CommonForm'

interface Props extends DialogProps, CommonFormProps {}

export class CommonFormDialog extends ReactDialog<Props> {
  width = '95%'
  title = 'Editor'

  public constructor(props: Omit<Props, 'context'>) {
    super(props)
  }

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const formRef = useRef({
        exportResult: () => null,
      })

      props.context.handleResult = async () => {
        return await formRef.current.exportResult()
      }
      return <CommonForm ref={formRef} fields={props.fields} data={props.data} />
    }
  }
}
