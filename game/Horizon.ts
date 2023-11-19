import Cloud from "./Cloud"
import HorizonLine from "./HorizonLine"
import Obstacle from "./Obstacle"
import Runner from "./Runner"
import { getRandomNum } from "./varibles"

export default class Horizon {
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource
  spritePos!: SpritePosDef

  horizonLine!: HorizonLine
  dimensions!: Dimensions
  cloudFrequency = Cloud.config.CLOUD_FREQUENCY
  cloudSpeed = Cloud.config.BG_CLOUD_SPEED
  clouds: Cloud[] = []

  gapCoeffecient!: number
  obstacles: Obstacle[] = []
  obstacleHistory: string[] = []

  constructor(canvas: HTMLCanvasElement, spritePos: SpritePosDef, dimensions: Dimensions, gapCoeffient: number) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    this.spritePos = spritePos
    this.dimensions = dimensions
    this.gapCoeffecient = gapCoeffient

    this.init()
  }

  private init() {
    this.addCloud()
    this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON)
  }

  update(deltaTime: number, speed: number, hasObstacles?: boolean) {
    this.horizonLine.update(deltaTime, speed)
    this.updateCloud(deltaTime, speed)
    if (hasObstacles) {
      this.updateObstacles(deltaTime, speed)
    }
  }

  addCloud() {
    this.clouds.push(new Cloud(this.canvas, this.spritePos.CLOUD, this.dimensions.WIDTH))
  }

  updateCloud(deltaTime: number, speed: number) {
    let cloudSpeed = Math.ceil((deltaTime * this.cloudSpeed * speed) / 1000)
    let numClouds = this.clouds.length

    if (numClouds) {
      for (let i = numClouds - 1; i >= 0; i--) {
        this.clouds[i].update(cloudSpeed)
      }

      let lastCloud = this.clouds[numClouds - 1]

      if (
        numClouds < Cloud.config.MAX_CLOUDS &&
        this.dimensions.WIDTH - lastCloud.xPos > lastCloud.cloudGap &&
        this.cloudFrequency > Math.random()
      ) {
        this.addCloud()
      }

      this.clouds = this.clouds.filter((obj) => !obj.remove)
    } else {
      this.addCloud()
    }
  }

  addNewObstacle(currentSpeed: number) {
    // Random obstacles
    let obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1)
    let obstacleType = Obstacle.types[obstacleTypeIndex]
    if (this.duplicateObstacleCheck(obstacleType.type) || currentSpeed < obstacleType.minSpeed) {
      this.addNewObstacle(currentSpeed)
    } else {
      let obstacleSpritePos = this.spritePos[obstacleType.type]

      this.obstacles.push(
        new Obstacle(
          this.canvas,
          obstacleSpritePos,
          obstacleType,
          this.dimensions,
          this.gapCoeffecient,
          currentSpeed,
          obstacleType.width
        )
      )
      this.obstacleHistory.unshift(obstacleType.type)

      if (this.obstacleHistory.length > 1) {
        this.obstacleHistory.splice(Runner.config.MAX_OBSTACLE_DUPLICATION)
      }
    }
  }

  duplicateObstacleCheck(nextObstacleType: string) {
    let duplicateCount = 0
    for (let i = 0; i < this.obstacleHistory.length; i++) {
      duplicateCount = this.obstacleHistory[i] == nextObstacleType ? duplicateCount + 1 : 0
    }
    return duplicateCount >= Runner.config.MAX_OBSTACLE_DUPLICATION
  }

  updateObstacles(deltaTime: number, currentSpeed: number) {
    let updateObstacles = this.obstacles.slice(0)
    for (let i = 0; i < this.obstacles.length; i++) {
      let obstacle = this.obstacles[i]
      obstacle.update(deltaTime, currentSpeed)

      if (obstacle.remove) {
        updateObstacles.shift()
      }
    }

    this.obstacles = updateObstacles
    if (this.obstacles.length) {
      let lastObstacle = this.obstacles[this.obstacles.length - 1]
      if (
        !lastObstacle.followingObstacleCreated &&
        lastObstacle.isVisible() &&
        lastObstacle.xPos + lastObstacle.width + lastObstacle.gap < this.dimensions.WIDTH
      ) {
        this.addNewObstacle(currentSpeed)
        lastObstacle.followingObstacleCreated = true
      }
    } else {
      this.addNewObstacle(currentSpeed)
    }
  }
}
