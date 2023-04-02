import SpriteDefinition from "./SpriteDefinition"
import { IS_HDPI } from "./varibles"

export default class HorizonLine {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource

  sourceDimensions = { ...HorizonLine.dimensions }
  dimensions = HorizonLine.dimensions
  spritePos = SpriteDefinition.getPos().HORIZON
  sourceXPos = [0, HorizonLine.dimensions.WIDTH]
  xPos: number[] = []
  yPos = 0
  bumpThreshold = 0.5

  constructor(ctx: CanvasRenderingContext2D, spriteImage: CanvasImageSource) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.init()
    this.draw()
  }

  private init() {
    this.setSourceDimensions()
  }

  private setSourceDimensions() {
    if (IS_HDPI) {
      this.sourceDimensions.HEIGHT *= 2
      this.sourceDimensions.WIDTH *= 2
    }
    this.sourceXPos = [this.spritePos.x, this.spritePos.x + this.sourceDimensions.WIDTH]
    this.xPos = [0, this.dimensions.WIDTH]
    this.yPos = this.dimensions.YPOS
  }

  private draw() {
    this.ctx.drawImage(
      this.spriteImage,
      this.sourceXPos[0],
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[0],
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    )
    this.ctx.drawImage(
      this.spriteImage,
      this.sourceXPos[1],
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[1],
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    )
  }

  updateXPos(pos: number, increment: number) {
    var line1 = pos
    var line2 = pos == 0 ? 1 : 0
    this.xPos[line1] -= increment
    this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH
    if (this.xPos[line1] <= -this.dimensions.WIDTH) {
      this.xPos[line1] += this.dimensions.WIDTH * 2
      this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH
      this.sourceXPos[line1] = this.getRandomType()
    }
  }

  update(deltaTime: number, speed: number) {
    var increment = Math.floor(speed * (HorizonLine.FPS / 1000) * deltaTime)
    if (this.xPos[0] <= 0) {
      this.updateXPos(0, increment)
    } else {
      this.updateXPos(1, increment)
    }
    this.draw()
  }

  // Get random horizonLine type
  getRandomType() {
    return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0
  }

  static FPS = 60

  static dimensions = {
    WIDTH: 600,
    HEIGHT: 12,
    YPOS: 127
  }
}
