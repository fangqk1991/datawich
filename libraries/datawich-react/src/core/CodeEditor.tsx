import React from 'react'
import Editor, { EditorProps } from '@monaco-editor/react'
import styled from '@emotion/styled'

const Wrapper = styled.div`
  border: #d9d9d9 solid 1px;
  border-radius: 6px;
  padding-top: 8px;

  .monaco-editor {
    min-height: 100px;
  }
`

export const CodeEditor: React.FC<EditorProps> = (props) => {
  return (
    <Wrapper>
      <Editor
        language='javascript'
        theme='light'
        {...props}
        options={{
          tabSize: 2,
          ...(props.options || {}),
        }}
      />
    </Wrapper>
  )
}
