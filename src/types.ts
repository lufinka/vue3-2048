import { type ViteSSGContext } from 'vite-ssg'

export type UserModule = (ctx: ViteSSGContext) => void

export interface rock {
  x: number
  y: number
  num: number
  isNew: boolean
  canCalc?: boolean
  id: number
  color: string
}
export interface LevelItem {
  map: Array<Array<number>>
}

export interface handleDirectResult {
  handleArr: Function
  handleCondition: Function
  next: Function
  handleMove: Function
}
