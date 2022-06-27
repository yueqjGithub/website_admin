import { CloseOutlined } from '@ant-design/icons'
import { Button, message, Spin } from 'antd'
import React, { ChangeEvent, MutableRefObject, useRef, useContext } from 'react'
import { ContentGroup, ContentItemType } from '..'
import { httpApi } from '../../../../service/axios'
import { Context } from '../../../../store/context'
type Props = ContentGroup<'video'> & {
  onChange?: (val: ContentItemType[]) => any
}

const videoEdit = (props: Props) => {
  const { content } = props
  const [list, setList] = React.useState<ContentItemType[]>([...content])
  const { state } = useContext(Context)
  const { currentGame } = state
  const [loading, setLoading] = React.useState(false)
  const ref: MutableRefObject<any> = useRef(null)
  const uploadHandler = async (e:ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : ''
    if (!file) {
      message.error('获取上传信息失败')
      return false
    }
    const fm = new FormData()
    fm.append('file', file)
    fm.append('siteId', currentGame)
    setLoading(true)
    try {
      const { data: res } = await httpApi({
        apiId: 'upload',
        state,
        method: 'POST',
        data: fm,
        httpCustomConfig: {
          timeout: 300000,
          headers: {
            actionName: encodeURIComponent('内容资源上传')
          }
        }
      }).request
      if (res.status === 0) {
        message.success('上传成功')
        const newList = [...list]
        newList.push({
          data: res.data,
          link: undefined
        })
        setList(newList)
        if (props.onChange) {
          props.onChange(newList)
        }
      } else {
        message.error(res.error_msg || res.message)
      }
    } catch (e) {
      message.error('上传出错')
    } finally {
      ref.current.value = ''
      setLoading(false)
    }
  }
  const delIcon = (target: ContentItemType) => {
    const newList = [...list]
    newList.splice(newList.indexOf(target), 1)
    setList(newList)
    if (props.onChange) {
      props.onChange(newList)
    }
  }
  return (
    <div className='full-width'>
      <input type="file" accept="video/*" ref={ref} style={{ display: 'none' }} onChange={e => uploadHandler(e)}/>
      <Spin spinning={loading}>
        <div className='full-width flex-col flex-jst-start flex-ali-start'>
          {
            list.map((item) => {
              return (
                <div key={item.data} className='flex-row flex-jst-start flex-ali-center'>
                  <div className='flex-row flex-jst-start flex-ali-base'>
                    <span className='ma-rt-05'>{item.data}</span>
                    <Button className='ma-lf-05' type='primary' size='small' danger shape='circle' icon={<CloseOutlined />} onClick={() => delIcon(item)}></Button>
                  </div>
                </div>
              )
            })
          }
          <div className='flex-col flex-jst-center flex-ali-start'>
            <Button type='primary' onClick={() => ref.current!.click()}>添加</Button>
            <div className='text-grey font-12'>上传格式：webm、mp4、Ogg</div>
            <div className='text-grey font-12'>文件建议大小：小于1G</div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default videoEdit
