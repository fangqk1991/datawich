import React from 'react'

export const TinyList = ({ children }: React.ComponentProps<any>) => {
  return (
    <ul
      style={{
        paddingInlineStart: '10px',
        marginBlockStart: '4px',
      }}
    >
      {children}
    </ul>
  )
}
