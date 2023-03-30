import SpriteDefinition from "./SpriteDefinition"

export default class HorizonLine {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource

  sourceDimensions = Object.assign({}, HorizonLine.dimensions)
  dimensions = Object.assign({}, HorizonLine.dimensions)
  spritePos = SpriteDefinition.getPositions().HORIZON
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

  init() {
    this.setSourceDimensions()
  }

  setSourceDimensions() {
    if (SpriteDefinition.getIsHdpi()) {
      this.sourceDimensions.HEIGHT *= 2
      this.sourceDimensions.WIDTH *= 2
    }
    this.sourceXPos = [this.spritePos.x, this.spritePos.x + this.sourceDimensions.WIDTH]
    this.xPos = [0, this.dimensions.WIDTH]
    this.yPos = this.dimensions.YPOS
  }

  draw() {
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

  static dimensions = {
    WIDTH: 600,
    HEIGHT: 12,
    YPOS: 127
  }
}
