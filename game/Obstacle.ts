import Runner from "./Runner"
import { FPS, IS_HIDPI, getRandomNum } from "./varibles"

export default class Obstacle {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D

  spritePos!: Position
  typeConfig!: ConfigDict
  gapCoefficient!: number
  // 每组障碍物的数量（随机 1~3 个）
  size!: number
  dimensions!: Dimensions
  remove!: boolean
  xPos!: number
  yPos!: number
  width!: number
  gap!: number
  speedOffset!: number

  currentFrame!: number
  timer!: number

  followingObstacleCreated = false

  constructor(
    canvas: HTMLCanvasElement,
    spritePos: Position,
    type: ConfigDict,
    dimensions: Dimensions,
    gapCoefficient: number,
    speed: number,
    optXOffset?: number
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    this.spritePos = spritePos
    this.typeConfig = type
    this.gapCoefficient = gapCoefficient
    // #obstacles in each obstacle group
    this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH)
    this.dimensions = dimensions
    this.remove = false
    this.xPos = dimensions.WIDTH + (optXOffset || 0)
    this.yPos = 0

    this.gap = 0
    this.speedOffset = 0

    // Non-static obstacles
    this.currentFrame = 0
    this.timer = 0

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

    // 对于速度与地面不同的障碍物（翼龙）进行速度修正
    // 使得有的速度看起来快一些，有的看起来慢一些
    if (this.typeConfig.speedOffset) {
      this.speedOffset = Math.random() > 0.5 ? this.typeConfig.speedOffset : -this.typeConfig.speedOffset
    }

    // 障碍物的间隙随游戏速度变化而改变
    this.gap = this.getGap(this.gapCoefficient, speed)
  }

  getGap(gapCoefficient: number, speed: number) {
    let minGap = Math.round(this.width * speed + this.typeConfig.minGap * gapCoefficient)
    let maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT)
    return getRandomNum(minGap, maxGap)
  }

  /**
   * Draw and crop based on size.
   */
  draw() {
    let sourceWidth = this.typeConfig.width
    let sourceHeight = this.typeConfig.height

    if (IS_HIDPI) {
      sourceWidth = sourceWidth * 2
      sourceHeight = sourceHeight * 2
    }

    // X position in sprite.
    let sourceX = sourceWidth * this.size * (0.5 * (this.size - 1)) + this.spritePos.x

    // Animation frames.
    if (this.currentFrame > 0) {
      sourceX += sourceWidth * this.currentFrame
    }
    this.ctx.drawImage(
      Runner.imageSprite,
      sourceX,
      this.spritePos.y,
      sourceWidth * this.size,
      sourceHeight,
      this.xPos,
      this.yPos,
      this.typeConfig.width * this.size,
      this.typeConfig.height
    )
  }

  /** Obstacle frame update. */
  update(deltaTime: number, speed: number) {
    if (!this.remove) {
      if (this.typeConfig.speedOffset) {
        speed += this.speedOffset
      }
      this.xPos -= Math.floor(speed * (FPS / 1000) * deltaTime)

      // Update frame
      if (this.typeConfig.numFrames) {
        this.timer += deltaTime

        if (this.typeConfig.frameRate && this.timer >= this.typeConfig.frameRate) {
          this.currentFrame = this.currentFrame == this.typeConfig.numFrames - 1 ? 0 : this.currentFrame + 1
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
  static types: ConfigDict[] = [
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
