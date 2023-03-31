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

  private init() {
    this.horizonLine = new HorizonLine(this.ctx, this.spriteImage)
  }

  update(deltaTime: number, speed: number) {
    this.horizonLine.update(deltaTime, speed)
  }
}
