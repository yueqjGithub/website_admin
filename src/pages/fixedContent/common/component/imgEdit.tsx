import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Input, message, Spin } from 'antd'
import React, { ChangeEvent, MutableRefObject, useRef, useContext } from 'react'
import { ContentGroup, ContentItemType } from '..'
import { httpApi } from '../../../../service/axios'
import { Context } from '../../../../store/context'
import styles from './styles/upload.module.scss'
type Props = ContentGroup<'images'> & {
  onChange?: (val: ContentItemType[]) => any
}

const ImgEdit = (props: Props) => {
  const { content } = props
  const [list, setList] = React.useState<ContentItemType[]>([...content])
  const { state } = useContext(Context)
  const { currentGame } = state
  const [loading, setLoading] = React.useState(false)
  const ref: MutableRefObject<any> = useRef(null)
  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const { value } = e.target
    const newList = [...list]
    newList[idx].link = value
    setList(newList)
  }
  const uploadHandler = async (e:ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : ''
    if (!file) {
      message.error('获取上传信息失败')
      return false
    }
    const fm = new FormData()
    fm.append('file', file)
    fm.append('siteId', currentGame)
    fm.append('fast', '1')
    setLoading(true)
    try {
      const { data: res } = await httpApi({
        apiId: 'upload',
        state,
        method: 'POST',
        data: fm,
        httpCustomConfig: {
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
      <input type="file" accept="image/*" ref={ref} style={{ display: 'none' }} onChange={e => uploadHandler(e)}/>
      <Spin spinning={loading}>
        <div className='full-width flex-row flex-jst-start flex-ali-start flex-wrap'>
          {
            list.map((item, idx) => {
              return (
                <div key={item.data} className='flex-col flex-jst-start flex-ali-center' style={{ marginLeft: 10 }}>
                  <div className={`${styles.uploadOut} ${styles.showImg} flex-col flex-jst-center flex-ali-center`}>
                    <img src={item.data} alt="" className={`${styles.imgResult}`}/>
                    <div className={`${styles.delBtn}`}>
                      <Button type='primary' size='small' danger shape='circle' icon={<CloseOutlined />} onClick={() => delIcon(item)}></Button>
                    </div>
                  </div>
                  <div className='pa-col-sm'></div>
                  <Input placeholder='请输入附带文字/链接' defaultValue={item.link} onChange={e => inputHandler(e, idx)}></Input>
                </div>
              )
            })
          }
          <div className={`${styles.uploadOut} ${styles.ctrl} flex-col flex-jst-center flex-ali-center`}>
            <Button type='primary' shape='circle' icon={<PlusOutlined />} size='large' onClick={() => ref.current!.click()}></Button>
            <div className='text-grey font-12'>上传格式：png、jpg、gif</div>
            <div className='text-grey font-12'>文件建议大小：小于2M</div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default ImgEdit
