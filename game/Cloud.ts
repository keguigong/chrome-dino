import Runner from "./Runner"
import { getRandomNum, IS_HIDPI } from "./varibles"

export default class Cloud {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  spritePos!: Position
  containerWidth!: number

  xPos = Runner.defaultDimensions.WIDTH
  yPos = 0
  remove = false
  cloudGap = getRandomNum(Cloud.config.MIN_CLOUD_GAP, Cloud.config.MAX_CLOUD_GAP)

  constructor(canvas: HTMLCanvasElement, spritePos: Position, containerWidth: number) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    this.spritePos = spritePos
    this.containerWidth = containerWidth

    this.xPos = containerWidth
    this.yPos = 0

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
    if (IS_HIDPI) {
      sourceWidth *= 2
      sourceHeight *= 2
    }
    this.ctx.drawImage(
      Runner.imageSprite,
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
