import React from 'react'
import { ContentEnum, ContentGroup, ContentItemType } from '..'
import ImgEdit from './imgEdit'
import RichEdit from './richEdit'
import TextEdit from './TextEdit'
import VideoEdit from './videoEdit'
type Props<T extends ContentEnum> = {
  data?: ContentGroup<T>
  onChange?: (val: ContentGroup<T>) => any
}

const BaseEdit: <T extends ContentEnum = 'text'>(props: Props<T>) => React.ReactElement = (props) => {
  // const { type, content } = props.data
  const { data } = props
  const { type, content } = data || { type: 'text', content: [] }
  const submitVal = (val: ContentItemType[]) => {
    if (props.onChange) {
      const obj = {
        type,
        content: val
      }
      props.onChange(obj as any)
    }
  }
  const renderEdit = () => {
    switch (type) {
      case 'text':
        return <TextEdit type={type} content={content} onChange={submitVal}></TextEdit>
      case 'images':
        return <ImgEdit type={type} content={content} onChange={submitVal}></ImgEdit>
      case 'video':
        return <VideoEdit type={type} content={content} onChange={submitVal}></VideoEdit>
      case 'richText':
        return <RichEdit type={type} content={content} onChange={submitVal}></RichEdit>
      default:
        return <></>
    }
  }
  return (
    <div className='full-width flex-row flex-jst-btw flex-ali-center'>
      {
        renderEdit()
      }
    </div>
  )
}

// const BaseEdit = ({ type, data }: Props) => {
//   return (
//     <></>
//   )
// }

export default BaseEdit
