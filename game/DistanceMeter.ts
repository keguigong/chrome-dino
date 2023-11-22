import Runner from "./Runner"
import { IS_HIDPI } from "./varibles"

export default class DistanceMeter {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  spritePos!: Position

  x = 2
  y = 2

  distance = 0
  maxScore = 0
  highScore = "0"

  digits: string[] = [] // 存储分数的每一位数字
  achievement = false // 是否进行闪动特效
  defaultString = "" // 游戏的默认距离（00000）
  flashTimer = 0 // 动画计时器
  flashIterations = 0 // 特效闪动的次数

  config = DistanceMeter.config
  maxScoreUnits = DistanceMeter.config.MAX_DISTANCE_UNITS // 分数的最大位数
  canvasWidth = 0

  constructor(canvas: HTMLCanvasElement, spritePos: Position, canvasWidth: number) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.spritePos = spritePos
    this.canvasWidth = canvasWidth

    this.init(canvasWidth)
  }

  /**
   * Initialise the distance meter to '00000'.
   */
  init(width: number) {
    let maxDistanceStr = ""

    this.calcXPos(width)
    for (let i = 0; i < this.maxScoreUnits; i++) {
      this.draw(i, 0)
      this.defaultString += "0"
      maxDistanceStr += "9"
    }

    this.readHighScore()
    this.maxScore = parseInt(maxDistanceStr)
  }

  /**
   * Calculate the xPos in the canvas.
   */
  calcXPos(canvasWidth: number) {
    this.x = canvasWidth - DistanceMeter.dimensions.DEST_WIDTH * (this.maxScoreUnits + 1)
  }

  draw(digitPos: number, value: number, optHighScore?: boolean) {
    let sourceWidth = DistanceMeter.dimensions.WIDTH
    let sourceHeight = DistanceMeter.dimensions.HEIGHT
    let sourceX = DistanceMeter.dimensions.WIDTH * value
    let sourceY = 0

    let targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH
    let targetY = this.y
    let targetWidth = DistanceMeter.dimensions.WIDTH
    let targetHeight = DistanceMeter.dimensions.HEIGHT

    // For high DPI we 2x source values.
    if (IS_HIDPI) {
      sourceWidth *= 2
      sourceHeight *= 2
      sourceX *= 2
    }

    sourceX += this.spritePos.x
    sourceY += this.spritePos.y

    this.ctx.save()

    let highScoreX = this.x - this.maxScoreUnits * 2 * DistanceMeter.dimensions.WIDTH

    if (optHighScore) {
      this.ctx.translate(highScoreX, this.y)
    } else {
      this.ctx.translate(this.x, this.y)
    }

    this.ctx.drawImage(
      Runner.imageSprite,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight
    )

    this.ctx.restore()
  }

  /**
   * Covert pixel distance to a 'real' distance.
   */
  getActualDistance(distance: number) {
    return distance ? Math.round(distance * this.config.COEFFICIENT) : 0
  }

  /**
   * Update the distance meter.
   */
  update(deltaTime: number, distance: number) {
    let paint = true
    let playSound = false

    if (!this.achievement) {
      distance = this.getActualDistance(distance)
      // Score has gone beyond the initial digit count.
      if (distance > this.maxScore && this.maxScoreUnits == this.config.MAX_DISTANCE_UNITS) {
        this.maxScoreUnits++
        this.maxScore = parseInt(this.maxScore + "9")
      } else {
        this.distance = 0
      }

      if (distance > 0) {
        // Achievement unlocked.
        if (distance % this.config.ACHIEVEMENT_DISTANCE == 0) {
          // Flash score and play sound.
          this.achievement = true
          this.flashTimer = 0
          playSound = true
        }
        // Create a string representation of the distance with leading 0.
        let distanceStr = (this.defaultString + distance).substr(-this.maxScoreUnits)
        this.digits = distanceStr.split("")
      }
    } else {
      // Control flashing of the score on reaching acheivement.
      if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
        this.flashTimer += deltaTime

        if (this.flashTimer < this.config.FLASH_DURATION) {
          paint = false
        } else if (this.flashTimer > this.config.FLASH_DURATION * 2) {
          this.flashTimer = 0
          this.flashIterations++
        }
      } else {
        this.achievement = false
        this.flashIterations = 0
        this.flashTimer = 0
      }
    }

    // Draw the digits if not flashing.
    if (paint) {
      for (let i = this.digits.length - 1; i >= 0; i--) {
        this.draw(i, parseInt(this.digits[i]))
      }
    }

    this.drawHighScore()
    return playSound
  }

  /**
   * Draw the high score.
   */
  drawHighScore() {
    if (parseInt(this.highScore, 16) > 0) {
      this.ctx.save()
      this.ctx.globalAlpha = 0.8
      for (let i = this.highScore.length - 1; i >= 0; i--) {
        this.draw(i, parseInt(this.highScore[i], 16), true)
      }
      this.ctx.restore()
    }
  }

  /**
   * Set the highscore as a array string.
   * Position of char in the sprite: H - 10, I - 11.
   */
  setHighScore(distance: number) {
    distance = this.getActualDistance(distance)
    let highScoreStr = (this.defaultString + distance).substr(-this.maxScoreUnits)

    this.saveHighScore(highScoreStr)
    this.highScore = "AB " + highScoreStr
  }

  readHighScore() {
    const localValue = localStorage.getItem("chrome-dino-high-score")
    if (localValue) {
      let highScoreStr = (this.defaultString + parseInt(localValue)).substr(-this.maxScoreUnits)
      this.highScore = "AB " + highScoreStr
    }
  }

  saveHighScore(score: string) {
    localStorage.setItem("chrome-dino-high-score", score)
  }

  reset() {
    this.update(0, 0)
    this.achievement = false
  }

  static config = {
    MAX_DISTANCE_UNITS: 5, // 分数的最大位数
    ACHIEVEMENT_DISTANCE: 100, // 每 100 米触发一次闪动特效
    COEFFICIENT: 0.025, // 将像素距离转换为比例单位的系数
    FLASH_DURATION: 1000 / 4, // 一闪的时间（一次闪动分别两闪：从有到无，从无到有）
    FLASH_ITERATIONS: 3 // 闪动的次数
  }

  static dimensions = {
    WIDTH: 10,
    HEIGHT: 13,
    DEST_WIDTH: 11 // 加上间隔后每个数字的宽度
  }
}
