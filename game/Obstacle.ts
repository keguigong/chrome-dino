import CollisionBox from "./CollisionBox"
import Runner from "./Runner"
import { FPS, IS_HIDPI, getRandomNum } from "./varibles"

export default class Obstacle {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  spritePos!: Position
  typeConfig!: ConfigDict
  gapCoefficient!: number

  // #obstacles in each obstacle group
  size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH)
  dimensions!: Dimensions
  remove = false
  xPos = 0
  yPos = 0
  width = 0
  gap = 0
  speedOffset = 0

  // Non-static obstacles
  currentFrame = 0
  timer = 0

  followingObstacleCreated = false

  collisionBoxes: CollisionBox[] = []

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
    this.ctx = canvas.getContext("2d")!
    this.spritePos = spritePos
    this.typeConfig = type
    this.gapCoefficient = gapCoefficient
    this.dimensions = dimensions

    this.xPos = dimensions.WIDTH + (optXOffset || 0)
    this.yPos = 0

    this.init(speed)
  }

  init(speed: number) {
    this.cloneCollisionBoxes()

    // Only allow sizing if we're at the right speed.
    if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
      this.size = 1
    }

    this.width = this.typeConfig.width * this.size

    // Check if obstacle can be positioned at various heights.
    if (Array.isArray(this.typeConfig.yPos)) {
      let yPosConfig = this.typeConfig.yPos
      this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)]
    } else {
      this.yPos = this.typeConfig.yPos
    }
    this.draw()

    // Make collision box adjustments,
    // Central box is adjusted to the size as one box.
    //      ____        ______        ________
    //    _|   |-|    _|     |-|    _|       |-|
    //   | |<->| |   | |<--->| |   | |<----->| |
    //   | | 1 | |   | |  2  | |   | |   3   | |
    //   |_|___|_|   |_|_____|_|   |_|_______|_|
    //
    if (this.size > 1) {
      this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width - this.collisionBoxes[2].width
      this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width
    }

    // For obstacles that go at a different speed from the horizon.
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
    const isBdayCake = Obstacle.isBdayCake(this.typeConfig.type)
    this.ctx.drawImage(
      isBdayCake ? Runner.imageBdaySprite : Runner.imageSprite,
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

  cloneCollisionBoxes() {
    let collisionBoxes = this.typeConfig.collisionBoxes

    for (let i = collisionBoxes.length - 1; i >= 0; i--) {
      this.collisionBoxes[i] = new CollisionBox(
        collisionBoxes[i].x,
        collisionBoxes[i].y,
        collisionBoxes[i].width,
        collisionBoxes[i].height
      )
    }
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
      minSpeed: 0,
      collisionBoxes: [new CollisionBox(0, 7, 5, 27), new CollisionBox(4, 0, 6, 34), new CollisionBox(10, 4, 7, 14)]
    },
    {
      type: "CACTUS_LARGE",
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 7,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [new CollisionBox(0, 12, 7, 38), new CollisionBox(8, 0, 7, 49), new CollisionBox(13, 10, 10, 38)]
    },
    {
      type: "PTERODACTYL",
      width: 46,
      height: 40,
      yPos: [100, 75, 50], // Variable height.
      yPosMobile: [100, 50], // Variable height mobile.
      multipleSpeed: 999,
      minSpeed: 8.5,
      minGap: 150,
      collisionBoxes: [
        new CollisionBox(15, 15, 16, 5),
        new CollisionBox(18, 21, 24, 6),
        new CollisionBox(2, 14, 4, 3),
        new CollisionBox(6, 10, 4, 7),
        new CollisionBox(10, 8, 6, 9)
      ],
      numFrames: 2,
      frameRate: 1000 / 6,
      speedOffset: 0.8
    },
    // {
    //   type: "BIRTHDAY_CAKE",
    //   width: 33,
    //   height: 40,
    //   yPos: 90,
    //   multipleSpeed: 999,
    //   minGap: 100,
    //   minSpeed: 0,
    //   collisionBoxes: [new CollisionBox(13, 1, 6, 12), new CollisionBox(6, 13, 20, 4), new CollisionBox(3, 18, 27, 19)]
    // }
    {
      type: "HP",
      width: 28,
      height: 26,
      yPos: [100, 75, 50],
      multipleSpeed: 999,
      minGap: 150,
      minSpeed: 8.5,
      collisionBoxes: [new CollisionBox(0, 0, 26, 24)]
    }
  ]

  static isBdayCake(type: string) {
    return ["BIRTHDAY_CAKE", "HP"].indexOf(type) > -1
  }
}
