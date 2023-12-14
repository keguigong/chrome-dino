import HorizonLine from "./HorizonLine"
import Runner from "./Runner"
import { IS_HIDPI } from "./varibles"

export default class Mountain {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  spritePos!: Position
  containerWidth = 0

  xPos = Runner.defaultDimensions.WIDTH
  yPos = 0

  constructor(canvas: HTMLCanvasElement, spritePos: Position, containerWidth: number) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.spritePos = spritePos
    this.containerWidth = containerWidth

    this.xPos = containerWidth
    this.yPos = HorizonLine.dimensions.YPOS - Mountain.config.HEIGHT

    this.draw()
  }

  updateXPos(currentPos: number, speed: number) {
    if (currentPos < -Mountain.config.WIDTH) {
      currentPos = this.containerWidth
    } else {
      currentPos -= speed
    }
    return currentPos
  }

  draw() {
    let sourceWidth = Mountain.config.WIDTH
    let sourceHeight = Mountain.config.HEIGHT
    if (IS_HIDPI) {
      sourceWidth *= 2
      sourceHeight *= 2
    }
    this.ctx.save()

    this.ctx.drawImage(
      Runner.imageBdaySprite,
      this.spritePos.x,
      this.spritePos.y,
      sourceWidth,
      sourceHeight,
      this.xPos,
      this.yPos,
      Mountain.config.WIDTH,
      Mountain.config.HEIGHT
    )

    this.ctx.restore()
  }

  update(deltaTime: number, speed: number) {
    this.xPos = this.updateXPos(this.xPos, Mountain.config.MOUNTAIN_SPEED * deltaTime)
    this.draw()
  }

  reset() {
    this.xPos = this.containerWidth
    this.draw()
  }

  protected isVisible() {
    return this.xPos + Mountain.config.WIDTH > 0
  }

  static config = {
    WIDTH: 413,
    HEIGHT: 92,
    MOUNTAIN_SPEED: 0.025
  }
}
