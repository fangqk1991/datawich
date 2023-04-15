import React from 'react'
import styled from '@emotion/styled'
import { ImagePreviewDialog } from './ImagePreviewDialog'

const Container = styled.div`
  img {
    cursor: pointer;
    width: 100%;
    display: block;
  }
`

interface Props {
  htmlContent: string
}

export const MyRichTextPanel: React.FC<Props> = (props) => {
  return (
    <Container
      {...props}
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (target.nodeName === 'IMG') {
          ImagePreviewDialog.preview(target.getAttribute('src') as string)
          event.preventDefault()
        }
      }}
      dangerouslySetInnerHTML={{
        __html: props.htmlContent,
      }}
    />
  )
}
