import HorizonLine from "./HorizonLine"

export default class Horizon {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource

  horizonLine!: HorizonLine

  constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.init()
  }

  init() {
    this.horizonLine = new HorizonLine(this.ctx, this.spriteImage)
  }
}
