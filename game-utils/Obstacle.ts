import { FPS, getRandomNum } from "./varibles"

export default class Obstacle {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource

  typeConfig!: Obstacle.Type
  spritePos!: Position
  gapCoefficient!: number
  dimensions!: Dimensions
  // 每组障碍物的数量（随机 1~3 个）
  size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH)
  xPos = 0
  yPos = 0
  width = 0

  remove = false
  gap = 0
  speedOffset = 0
  currentFrame = 0
  timer = 0

  followingObstacleCreated = false

  constructor(
    ctx: CanvasRenderingContext2D,
    spriteImage: CanvasImageSource,
    spritePos: Position,
    type: Obstacle.Type,
    dimensions: Dimensions,
    gapCoefficient: number,
    speed: number,
    xOffset: number
  ) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.spritePos = spritePos
    this.typeConfig = type
    this.gapCoefficient = gapCoefficient
    this.dimensions = dimensions
    this.xPos = dimensions.WIDTH + (xOffset || 0)

    this.init(speed)
  }

  init(speed: number) {
    if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
      this.size = 1
    }
    this.width = this.typeConfig.width + this.size

    if (Array.isArray(this.typeConfig.yPos)) {
      let yPosConfig = this.typeConfig.yPos
      this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)]
    } else {
      this.yPos = this.typeConfig.yPos
    }
    this.draw()

    if (this.typeConfig.speedOffset) {
      this.speedOffset =
        Math.random() > 0.5 ? this.typeConfig.speedOffset : -this.typeConfig.speedOffset
    }

    this.gap = this.getGap(this.gapCoefficient, speed)
  }

  getGap(gapCoefficient: number, speed: number) {
    let minGap = Math.round(this.width * speed + this.typeConfig.minGap * gapCoefficient)
    let maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT)
    return getRandomNum(minGap, maxGap)
  }

  draw() {
    let sw = this.typeConfig.width
    let sh = this.typeConfig.height
    let sx = sw * this.size * (0.5 * (this.size - 1)) + this.spritePos.x

    if (this.currentFrame > 0) {
      sx += sw * this.currentFrame
    }
    this.ctx.drawImage(
      this.spriteImage,
      sx,
      this.spritePos.y,
      sw * this.size,
      sh,
      this.xPos,
      this.yPos,
      this.typeConfig.width,
      this.typeConfig.height
    )
  }

  update(deltaTime: number, speed: number) {
    if (!this.remove) {
      if (this.typeConfig.speedOffset) {
        speed += this.speedOffset
      }

      this.xPos -= Math.floor(speed * (FPS / 1000) * deltaTime)

      if (this.typeConfig.numFrames) {
        this.timer += deltaTime

        if (this.typeConfig.frameRate && this.timer >= this.typeConfig.frameRate) {
          this.currentFrame =
            this.currentFrame == this.typeConfig.numFrames - 1 ? 0 : this.currentFrame + 1
          this.timer = 0
        }
      }
      this.draw()

      if (!this.isVisible()) {
        this.remove = true
      }
    }
  }

  isVisible() {
    return this.xPos + this.width > 0
  }

  static MAX_GAP_COEFFICIENT = 1.5
  static MAX_OBSTACLE_LENGTH = 3
  static types = [
    {
      type: "CACTUS_SMALL",
      width: 17,
      height: 35,
      yPos: 105,
      multipleSpeed: 4,
      minGap: 120,
      minSpeed: 0
    },
    {
      type: "CACTUS_LARGE",
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 7,
      minGap: 120,
      minSpeed: 0
    },
    {
      type: "PTERODACTYL",
      width: 46,
      height: 40,
      yPos: [100, 75, 50],
      multipleSpeed: 999,
      minSpeed: 8.5,
      minGap: 150,
      numFrames: 2,
      frameRate: 1000 / 6,
      speedOffset: 0.8
    }
  ]
}
