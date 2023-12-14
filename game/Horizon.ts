import Cloud from "./Cloud"
import HorizonLine from "./HorizonLine"
import Mountain from "./Mountain"
import NightMode from "./NightMode"
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

  nightMode!: NightMode
  mountain!: Mountain

  constructor(canvas: HTMLCanvasElement, spritePos: SpritePosDef, dimensions: Dimensions, gapCoeffient: number) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    this.spritePos = spritePos
    this.dimensions = dimensions
    this.gapCoeffecient = gapCoeffient

    this.init()
  }

  private init() {
    this.mountain = new Mountain(this.canvas, Runner.bdaySpriteDefinition.MOUNTAIN, this.dimensions.WIDTH)
    this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON)
    this.nightMode = new NightMode(this.canvas, this.spritePos.MOON, this.dimensions.WIDTH)
    this.addCloud()
  }

  update(deltaTime: number, speed: number, hasObstacles?: boolean, showNightMode: boolean = false) {
    this.mountain.update(deltaTime, speed)
    this.horizonLine.update(deltaTime, speed)
    this.nightMode.update(showNightMode)
    this.updateCloud(deltaTime, speed)
    if (hasObstacles) {
      this.updateObstacles(deltaTime, speed)
    }
  }

  addCloud() {
    const balloon = getRandomNum(1, 10) >= 5
    const spritePos = balloon ? Runner.bdaySpriteDefinition.BALLOON : this.spritePos.CLOUD
    const cloud = new Cloud(this.canvas, spritePos, this.dimensions.WIDTH, balloon)
    this.clouds.push(cloud)
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
    if (
      this.duplicateObstacleCheck(obstacleType.type) ||
      currentSpeed < obstacleType.minSpeed ||
      (obstacleType.type === "HP" && Math.random() > 0.2)
    ) {
      this.addNewObstacle(currentSpeed)
    } else {
      const isBdayObstacle = Obstacle.isBdayCake(obstacleType.type)
      let spritePos = isBdayObstacle
        ? Runner.bdaySpriteDefinition[obstacleType.type]
        : this.spritePos[obstacleType.type]

      this.obstacles.push(
        new Obstacle(
          this.canvas,
          spritePos,
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

  reset() {
    this.obstacles = []
    this.horizonLine.reset()
    this.nightMode.reset()
    this.mountain.reset()
  }
}
