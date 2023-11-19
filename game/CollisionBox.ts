export default class CollisionBox {
  x!: number
  y!: number
  width!: number
  height!: number

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x
    this.y = y
    this.width = w
    this.height = h
  }
}
