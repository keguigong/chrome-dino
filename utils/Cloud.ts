import SpriteDefinition from "./SpriteDefinition"

export default class Cloud {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource
  spritePos = SpriteDefinition.getPos().CLOUD
  conWidth!: number

  xPos = 0
  yPos = 0
  remove = false
  cloudGap = this.getRandomNum(Cloud.config.MIN_CLOUD_GAP, Cloud.config.MAX_CLOUD_GAP)

  constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource, conWidth: number) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.conWidth = conWidth
    this.xPos = conWidth
    this.init()
  }

  init() {
    this.yPos = this.getRandomNum(Cloud.config.MIN_SKY_LEVEL, Cloud.config.MAX_SKY_LEVEL)
    this.draw()
  }

  draw() {
    this.ctx.save()
    let sourceWidth = Cloud.config.WIDTH
    let sourceHeight = Cloud.config.HEIGHT
    if (Cloud.IS_HDPI) {
      sourceWidth *= 2
      sourceHeight *= 2
    }
    this.ctx.drawImage(
      this.spriteImage,
      this.spritePos.x,
      this.spritePos.y,
      sourceWidth,
      sourceHeight,
      this.xPos,
      this.yPos,
      Cloud.config.WIDTH,
      Cloud.config.HEIGHT
    )
    this.ctx.restore()
  }

  update(speed: number) {
    if (!this.remove) {
      this.xPos -= speed
      this.draw()
    }

    if (!this.isVisible()) {
      this.remove = true
    }
  }

  private isVisible() {
    return this.xPos + Cloud.config.WIDTH > 0
  }

  private getRandomNum(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static IS_HDPI = typeof window != "undefined" ? window.devicePixelRatio > 1 : false

  static config = {
    WIDTH: 46,
    HEIGHT: 14,
    MIN_CLOUD_GAP: 100, // 云之间的最小间隙
    MAX_CLOUD_GAP: 400, // 云之间的最大间隙
    MIN_SKY_LEVEL: 71, // 云的最小高度
    MAX_SKY_LEVEL: 30, // 云的最大高度
    BG_CLOUD_SPEED: 0.2, // 云的速度
    CLOUD_FREQUENCY: 0.5, // 云的频率
    MAX_CLOUDS: 6 // 云的最大数量
  }
}
