import Runner from "./Runner"
import { IS_HIDPI, getRandomNum } from "./varibles"

export default class NightMode {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D

  spritePos!: Position
  containerWidth!: number

  xPos = 0
  yPos = 30
  currentPhase = 0
  opacity = 0
  stars: any[] = []
  drawStars = false

  constructor(canvas: HTMLCanvasElement, spritePos: Position, containerWidth: number) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!

    this.spritePos = spritePos
    this.containerWidth = containerWidth

    this.xPos = containerWidth - 50
    this.yPos = 30

    this.placeStars()
  }

  update(activated: boolean) {
    // Moon phase.
    if (activated && this.opacity === 0) {
      this.currentPhase++

      if (this.currentPhase >= NightMode.phases.length) {
        this.currentPhase = 0
      }
    }

    // Fade in / out.
    if (activated && (this.opacity < 1 || this.opacity === 0)) {
      this.opacity += NightMode.config.FADE_SPEED
    } else if (this.opacity > 0) {
      this.opacity -= NightMode.config.FADE_SPEED
    }

    // Set moon positioning.
    if (this.opacity > 0) {
      this.xPos = this.updateXPos(this.xPos, NightMode.config.MOON_SPEED)

      // Update stars.
      if (this.drawStars) {
        for (let i = 0; i < NightMode.config.NUM_STARS; i++) {
          this.stars[i].x = this.updateXPos(this.stars[i].x, NightMode.config.STAR_SPEED)
        }
      }
      this.draw()
    } else {
      this.opacity = 0
      this.placeStars()
    }
    this.drawStars = true
  }

  updateXPos(currentPos: number, speed: number) {
    if (currentPos < -NightMode.config.WIDTH) {
      currentPos = this.containerWidth
    } else {
      currentPos -= speed
    }
    return currentPos
  }

  draw() {
    let moonSourceWidth = this.currentPhase === 3 ? NightMode.config.WIDTH * 2 : NightMode.config.WIDTH
    let moonSourceHeight = NightMode.config.HEIGHT
    let moonSourceX = this.spritePos.x + NightMode.phases[this.currentPhase]
    const moonOutputWidth = moonSourceWidth
    let starSize = NightMode.config.STAR_SIZE
    let starSourceX = Runner.spriteDefinition.LDPI.STAR.x

    if (IS_HIDPI) {
      moonSourceWidth *= 2
      moonSourceHeight *= 2
      moonSourceX = this.spritePos.x + NightMode.phases[this.currentPhase] * 2
      starSize *= 2
      starSourceX = Runner.spriteDefinition.HDPI.STAR.x
    }

    this.ctx.save()
    this.ctx.globalAlpha = this.opacity

    // Stars.
    if (this.drawStars) {
      for (let i = 0; i < NightMode.config.NUM_STARS; i++) {
        this.ctx.drawImage(
          Runner.imageSprite,
          starSourceX,
          this.stars[i].sourceY,
          starSize,
          starSize,
          Math.round(this.stars[i].x),
          this.stars[i].y,
          NightMode.config.STAR_SIZE,
          NightMode.config.STAR_SIZE
        )
      }
    }

    // Moon.
    this.ctx.drawImage(
      Runner.imageSprite,
      moonSourceX,
      this.spritePos.y,
      moonSourceWidth,
      moonSourceHeight,
      Math.round(this.xPos),
      this.yPos,
      moonOutputWidth,
      NightMode.config.HEIGHT
    )

    this.ctx.globalAlpha = 1
    this.ctx.restore()
  }

  placeStars() {
    const segmentSize = Math.round(this.containerWidth / NightMode.config.NUM_STARS)

    for (let i = 0; i < NightMode.config.NUM_STARS; i++) {
      this.stars[i] = {}
      this.stars[i].x = getRandomNum(segmentSize * i, segmentSize * (i + 1))
      this.stars[i].y = getRandomNum(0, NightMode.config.STAR_MAX_Y)

      if (IS_HIDPI) {
        this.stars[i].sourceY = Runner.spriteDefinition.HDPI.STAR.y + NightMode.config.STAR_SIZE * 2 * i
      } else {
        this.stars[i].sourceY = Runner.spriteDefinition.LDPI.STAR.y + NightMode.config.STAR_SIZE * i
      }
    }
  }

  reset() {
    this.currentPhase = 0
    this.opacity = 0
    this.update(false)
  }

  static config = {
    WIDTH: 20, // 半月的宽度
    HEIGHT: 40, // 月亮的高度
    FADE_SPEED: 0.035, // 淡入淡出的速度
    MOON_SPEED: 0.25, // 月亮的速度
    NUM_STARS: 2, // 星星的数量
    STAR_SIZE: 9, // 星星的大小
    STAR_SPEED: 0.3, // 星星的速度
    STAR_MAX_Y: 70 // 星星在画布上的最大 y 坐标
  }

  // 月亮所处的时期（不同的时期有不同的位置）
  static phases = [140, 120, 100, 60, 40, 20, 0]
}
