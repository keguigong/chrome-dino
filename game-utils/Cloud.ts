import SpriteDefinition from "./SpriteDefinition"
import { getRandomNum, IS_HDPI } from "./varibles"

export default class Cloud {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource
  spritePos = SpriteDefinition.getPos().CLOUD
  conWidth!: number

  xPos = 0
  yPos = 0
  remove = false
  cloudGap = getRandomNum(Cloud.config.MIN_CLOUD_GAP, Cloud.config.MAX_CLOUD_GAP)

  constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource, conWidth: number) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.conWidth = conWidth
    this.xPos = conWidth
    this.init()
  }

  protected init() {
    this.yPos = getRandomNum(Cloud.config.MIN_SKY_LEVEL, Cloud.config.MAX_SKY_LEVEL)
    this.draw()
  }

  protected draw() {
    this.ctx.save()
    let sourceWidth = Cloud.config.WIDTH
    let sourceHeight = Cloud.config.HEIGHT
    if (IS_HDPI) {
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

  protected isVisible() {
    return this.xPos + Cloud.config.WIDTH > 0
  }

  static config = {
    WIDTH: 46,
    HEIGHT: 14,
    MIN_CLOUD_GAP: 100,
    MAX_CLOUD_GAP: 400,
    MIN_SKY_LEVEL: 71,
    MAX_SKY_LEVEL: 30,
    BG_CLOUD_SPEED: 0.2,
    CLOUD_FREQUENCY: 0.5,
    MAX_CLOUDS: 6
  }
}
