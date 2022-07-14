import { PlusOutlined } from '@ant-design/icons'
import { Button, Divider, message, Radio, Spin, Switch } from 'antd'
import React, { ChangeEvent, MutableRefObject, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { httpApi } from '../../../service/axios'
import { Context } from '../../../store/context'
import { BannerElement, BannerItem } from '../common'
import styles from '../common/style.module.scss'
import Element from './element'
type Props = {
  target?: BannerItem
  onClose: Function
  editSuc: Function
}

const EditContainer = ({ target, onClose, editSuc }: Props) => {
  const { state } = useContext(Context)
  const { currentGame } = state
  const [bgUrl, setUrl] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [viewHeight, setViewHeight] = useState<number>(1)
  const [viewWidth, setViewWidth] = useState<number>(1)
  const [eleList, setList] = useState<Array<BannerElement<'text' | 'image'>>>([])
  const [status, setStatus] = useState<boolean>(true)
  const [isPre, setPre] = useState<boolean>(false)
  // banner类型1-pc,2-mobile
  const [type, setType] = useState<1 | 2>(1)
  // 编辑初始化
  useEffect(() => {
    if (target) {
      setUrl(target.imgUrl)
      setType(target.type)
      setList(JSON.parse(target.elements as string))
      setStatus(target.status)
    }
  }, [])
  // 计算该屏宽高
  useEffect(() => {
    if (bgUrl) {
      const cImg = document.createElement('img')
      cImg.style.width = `${type === 1 ? document.documentElement.clientWidth : 414}px`
      setLoading(true)
      cImg.onload = () => {
        setLoading(false)
        const w = type === 1 ? cImg.width : 414
        const h = type === 1 ? cImg.height : (414 / cImg.width) * cImg.height
        setViewHeight(h)
        setViewWidth(w)
      }
      cImg.src = bgUrl
    }
  }, [bgUrl, type])
  // 增加元素
  const addEle = (type: 'text' | 'image', src?: string, width?: number, height?: number) => {
    if (!bgUrl) {
      message.warning('请先设置背景')
      return false
    }
    const ele = new BannerElement()
    ele.type = type
    if (src) {
      ele.src = src
      ele.width = parseFloat((width! / 100).toFixed(2))
      ele.height = parseFloat((height! / 100).toFixed(2))
    }
    const copy = [...eleList]
    copy.push(ele)
    setList(copy as BannerElement<'image' | 'text'>[])
  }
  // 删除元素
  const delEle = (idx: number) => {
    const copy = [...eleList]
    copy.splice(idx, 1)
    setList(copy as BannerElement<'image' | 'text'>[])
  }
  // 上传
  const [uploadType, setUploadType] = useState<'bg' | 'ele'>()
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
        if (uploadType === 'bg') {
          setUrl(res.data)
        } else {
          const img = document.createElement('img')
          img.onload = () => {
            addEle('image', res.data, img.width, img.height)
            img.remove()
            setLoading(false)
          }
          img.src = res.data
        }
      } else {
        message.error(res.error_msg || res.message)
      }
    } catch (e) {
      message.error('上传出错')
    } finally {
      ref.current.value = ''
      if (uploadType === 'bg') {
        setLoading(false)
      }
    }
  }
  // 收集参数
  const getDataHandler = (val: BannerElement<'image' | 'text'>, idx: number) => {
    const copy = [...eleList]
    copy.splice(idx, 1, val)
    setList(copy)
  }
  // 提交
  const submitHandlder = async () => {
    const requestData: any = {
      siteId: currentGame,
      type: type,
      status: status,
      minHeight: viewHeight,
      imgUrl: bgUrl,
      elements: JSON.stringify(eleList)
    }
    if (target) {
      requestData.id = target.id
    }
    try {
      setLoading(true)
      const { data: res } = await httpApi({
        apiId: target ? 'updatebanner' : 'addbanner',
        state,
        method: 'POST',
        data: requestData
      }).request
      if (res.status === 0) {
        message.success('提交成功')
        editSuc()
      } else {
        message.error(res.message)
      }
    } finally {
      setLoading(false)
    }
  }
  // 设备
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'all'>('all')
  const filterEles = useMemo(() => {
    const copy = [...eleList]
    copy.forEach((item, idx) => {
      item.id = idx
    })
    if (deviceType === 'ios') {
      return copy.filter(item => item.device !== 'android')
    }
    if (deviceType === 'android') {
      return copy.filter(item => item.device !== 'ios')
    }
    return copy
  }, [deviceType, eleList])
  return (
    <div className={`${styles.editOut}`}>
      <input type="file" accept="image/*" ref={ref} style={{ display: 'none' }} onChange={e => uploadHandler(e)}/>
      {
        loading && <div className={`full-width full-height flex-row flex-jst-center flex-ali-center ${styles.loadingModal}`}>
          <Spin spinning={loading} />
        </div>
      }
      <div className={`${styles.editContainer} flex-row flex-jst-center flex-ali-start scroll-bar`}>
        <div className={`${styles.showView}`} style={{ width: type === 1 ? '100%' : '414px', overflow: type === 1 ? 'hidden' : 'visible' }}>
          {
            bgUrl && <img src={bgUrl} alt="" className={styles.bgImg}/>
          }
          {
            filterEles.map((item, idx) =>
              <Element
                submitData={getDataHandler} idx={idx}
                target={item} key={idx}
                viewHeight={viewHeight}
                viewWidth={viewWidth}
                onDelete={delEle}
                isPre={isPre}
                editType={type}
              ></Element>)
          }
        </div>
        <div className={`${styles.toolBar} flex-row flex-jst-start flex-ali-center`}>
          <div className={`${styles.tooldrop}`}>
            <i className='iconfont icon-gongjuxiang font-bold text-primary'></i>
          </div>
          <div className={`${styles.toolContainer}`}>
            <div className={styles.label}>banner类型</div>
            <Radio.Group defaultValue={type} onChange={e => {
              if (e.target.value === 1) {
                setDeviceType('all')
              }
              setType(e.target.value)
            }} disabled={isPre}>
              <Radio value={1}>PC</Radio>
              <Radio value={2}>MOBILE</Radio>
            </Radio.Group>
            {
              type === 2 && (
                <>
                  <div className="styles.label">元素过滤</div>
                  <Radio.Group defaultValue={deviceType} onChange={e => setDeviceType(e.target.value)} disabled={isPre}>
                    <Radio value='android'>仅看Android</Radio>
                    <Radio value='ios'>仅看IOS</Radio>
                    <Radio value='all'>全部</Radio>
                  </Radio.Group>
                </>
              )
            }
            <div className={styles.label}>启用状态</div>
            <Switch onChange={val => setStatus(val)} checked={status}></Switch>
            <div className={styles.label}>背景图片设置</div>
            <div className={`${styles.uploadOut} ${styles.ctrl} flex-col flex-jst-center flex-ali-center`}>
              <Button disabled={isPre} type='primary' shape='circle' icon={<PlusOutlined />} size='large' onClick={() => {
                setUploadType('bg')
                ref.current!.click()
              }}></Button>
              <div className='text-grey font-12'>上传格式：png、jpg、gif</div>
              <div className='text-grey font-12'>文件建议大小：小于2M</div>
            </div>
            <div className={styles.label}>增加元素</div>
            <div className="full-width flex-row flex-jst-start flex-ali-center">
              <Button disabled={isPre} size="small" type="primary" onClick={() => addEle('text')}>增加文字</Button>
              <Button disabled={isPre} size="small" className='ma-lf-05' type="primary" onClick={() => {
                if (!bgUrl) {
                  message.warning('请先设置背景')
                  return false
                }
                setUploadType('ele')
                ref.current!.click()
              }}>增加图片</Button>
            </div>
            <Divider></Divider>
            <div className="full-width flex-row flex-jst-start flex-ali-center">
              <Button size='small' onClick={() => onClose()} type="primary">离开</Button>
              <Button type="primary" className='ma-lf-05' size="small" onClick={() => setPre(!isPre)}>{isPre ? '退出预览' : '预览'}</Button>
              <Button size='small' className='ma-lf-05' type='primary' onClick={() => submitHandlder()}>提交</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditContainer
