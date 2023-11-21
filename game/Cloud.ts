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

  balloon = false
  config = Cloud.config

  constructor(canvas: HTMLCanvasElement, spritePos: Position, containerWidth: number, balloon?: boolean) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    this.spritePos = spritePos
    this.containerWidth = containerWidth

    if (balloon) {
      this.balloon = balloon
      this.config = { ...Cloud.config, ...Cloud.balloonConfig }
    }

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
    let sourceWidth = this.config.WIDTH
    let sourceHeight = this.config.HEIGHT
    if (IS_HIDPI) {
      sourceWidth *= 2
      sourceHeight *= 2
    }
    this.ctx.drawImage(
      this.balloon ? Runner.imageBdaySprite : Runner.imageSprite,
      this.spritePos.x,
      this.spritePos.y,
      sourceWidth,
      sourceHeight,
      this.xPos,
      this.yPos,
      this.config.WIDTH,
      this.config.HEIGHT
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
    return this.xPos + this.config.WIDTH > 0
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

  static balloonConfig = {
    WIDTH: 16,
    HEIGHT: 34
  }
}
