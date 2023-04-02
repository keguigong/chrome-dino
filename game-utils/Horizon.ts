import Cloud from "./Cloud"
import HorizonLine from "./HorizonLine"
import Obstacle from "./Obstacle"
import Runner from "./Runner"
import { getRandomNum } from "./varibles"

export default class Horizon {
  ctx!: CanvasRenderingContext2D
  spriteImage!: CanvasImageSource

  horizonLine!: HorizonLine

  dimensions!: Dimensions
  cloudFrequency = Cloud.config.CLOUD_FREQUENCY
  clouds: Cloud[] = []
  cloudSpeed = Cloud.config.BG_CLOUD_SPEED

  gapCoeffecient!: number
  obstacles!: Obstacle[]
  obstacleHistory: string[] = []

  constructor(
    ctx: CanvasRenderingContext2D,
    spriteImage: CanvasImageSource,
    dimensions: Dimensions,
    gapCoeffient: number
  ) {
    this.ctx = ctx
    this.spriteImage = spriteImage
    this.dimensions = dimensions
    this.gapCoeffecient = gapCoeffient
    this.init()
  }

  private init() {
    this.addCloud()
    this.horizonLine = new HorizonLine(this.ctx, this.spriteImage)
  }

  update(deltaTime: number, speed: number) {
    this.horizonLine.update(deltaTime, speed)
    this.updateCloud(deltaTime, speed)
  }

  addCloud() {
    this.clouds.push(new Cloud(this.ctx, this.spriteImage, this.dimensions.WIDTH))
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

      this.clouds.filter((item) => !item.remove)
    } else {
      this.addCloud()
    }
  }

  addNewObstacle(currentSpeed: number) {
    let obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1)
    let obstacleType = Obstacle.types[obstacleTypeIndex]
    this.obstacles.push(
      // new Obstacle(this.ctx, this.spriteImage, null, obstacleType, this.dimensions, this.gapCoeffecient, currentSpeed)
    )
  }

  updateObstacles(deltaTime: number, currentSpeed: number) {
    let updateObstacles = this.obstacles.slice()
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
      } else {
        this.addNewObstacle(currentSpeed)
      }
    }
  }
}
