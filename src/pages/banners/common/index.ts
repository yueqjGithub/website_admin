export class BannerItem {
  bgImg?: string
  minHeight: string = '100vh'
  elements: BannerElement[] = []

  constructor (target?: BannerItem) {
    const keyMaps = Object.keys(BannerItem)
    for (const k in target) {
      if (keyMaps.includes(k)) {
        this[k] = target[k]
      }
    }
  }

  createByJson (target: string) {
    const parseTarget = JSON.parse(target)
    const result = new BannerItem(parseTarget)
    return result
  }
}

export class BannerElement {
  type?: 'image' | 'text'
  style: string = ''
  src?: string
  width: string = ''
  height: string = ''
  top: string = ''
  left: string = ''
  hoverScale: boolean = false

  constructor (target: BannerElement) {
    const keyMaps = Object.keys(BannerElement)
    for (const k in target) {
      if (keyMaps.includes(k)) {
        this[k] = target[k]
      }
    }
  }
}
