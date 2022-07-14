export class BannerItem {
  id?: string
  imgUrl?: string
  minHeight: string = '100vh'
  type: 1 | 2 = 1
  status: boolean = true
  elements: BannerElement<ElementsType>[] | string = []

  constructor (target?: BannerItem) {
    const keyMaps = Object.keys(BannerItem)
    for (const k in target) {
      if (keyMaps.includes(k)) {
        this[k] = target[k]
      }
    }
  }
}

type ElementsType = 'image' | 'text'

export class BannerElement<T extends ElementsType> {
  id?: number | string
  type?: T
  style?: string = ''
  src?: string
  text?: string = '新增文字内容'
  width?: number = 200
  height?: number = 0
  top: number = 50
  left: number = 50
  color?: string = '#000'
  fontWight: boolean = true
  fontSize?: number = 0.2
  clickAble: boolean = false
  hoverScale: boolean = false
  href?: string
  device: 'android' | 'ios' | 'all' = 'all'

  constructor (target?: BannerElement<T>) {
    const keyMaps = Object.keys(BannerElement)
    for (const k in target) {
      if (keyMaps.includes(k)) {
        this[k] = target[k]
      }
    }
  }
}
