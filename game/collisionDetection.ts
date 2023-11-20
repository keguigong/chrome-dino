import CollisionBox from "./CollisionBox"
import Obstacle from "./Obstacle"
import Trex from "./Trex"

/**
 * Check for a collision.
 * @param {!Obstacle} obstacle
 * @param {!Trex} tRex T-rex object.
 * @param {CanvasRenderingContext2D=} opt_canvasCtx Optional canvas context for
 *    drawing collision boxes.
 * @return {Array<CollisionBox>|undefined}
 */
export function checkForCollision(obstacle: Obstacle, tRex: Trex, optCanvasCtx?: CanvasRenderingContext2D) {
  // Adjustments are made to the bounding box as there is a 1 pixel white
  // border around the t-rex and obstacles.
  const tRexBox = new CollisionBox(tRex.xPos + 1, tRex.yPos + 1, tRex.config.WIDTH - 2, tRex.config.HEIGHT - 1)

  const obstacleBox = new CollisionBox(
    obstacle.xPos + 1,
    obstacle.yPos + 1,
    obstacle.typeConfig.width * obstacle.size - 2,
    obstacle.typeConfig.height - 2
  )

  if (optCanvasCtx) {
    drawCollisionBoxes(optCanvasCtx, tRexBox, obstacleBox)
  }

  // Simple outer bounds check.
  if (boxCompare(tRexBox, obstacleBox)) {
    const collisionBoxes = obstacle.collisionBoxes
    let tRexCollisionBoxes = tRex.ducking ? Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING

    // Detailed axis aligned box check.
    for (let t = 0; t < tRexCollisionBoxes.length; t++) {
      for (let i = 0; i < collisionBoxes.length; i++) {
        // Adjust the box to actual positions.
        const adjTrexBox = createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox)
        const adjObstacleBox = createAdjustedCollisionBox(collisionBoxes[i], obstacleBox)
        const crashed = boxCompare(adjTrexBox, adjObstacleBox)

        // Draw boxes for debug.
        if (optCanvasCtx) {
          drawCollisionBoxes(optCanvasCtx, adjTrexBox, adjObstacleBox)
        }

        if (crashed) {
          return [adjTrexBox, adjObstacleBox]
        }
      }
    }
  }
}

/**
 * Adjust the collision box.
 * @param {!CollisionBox} box The original box.
 * @param {!CollisionBox} adjustment Adjustment box.
 * @return {CollisionBox} The adjusted collision box object.
 */
function createAdjustedCollisionBox(box: CollisionBox, adjustment: CollisionBox) {
  return new CollisionBox(box.x + adjustment.x, box.y + adjustment.y, box.width, box.height)
}

/**
 * Draw the collision boxes for debug.
 */
function drawCollisionBoxes(canvasCtx: CanvasRenderingContext2D, tRexBox: CollisionBox, obstacleBox: CollisionBox) {
  canvasCtx.save()
  canvasCtx.strokeStyle = "#f00"
  canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height)

  canvasCtx.strokeStyle = "#0f0"
  canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y, obstacleBox.width, obstacleBox.height)
  canvasCtx.restore()
}

/**
 * Compare two collision boxes for a collision.
 * @param {CollisionBox} tRexBox
 * @param {CollisionBox} obstacleBox
 * @return {boolean} Whether the boxes intersected.
 */
export function boxCompare(tRexBox: CollisionBox, obstacleBox: CollisionBox) {
  let crashed = false
  const tRexBoxX = tRexBox.x
  const tRexBoxY = tRexBox.y

  const obstacleBoxX = obstacleBox.x
  const obstacleBoxY = obstacleBox.y

  // Axis-Aligned Bounding Box method.
  if (
    tRexBox.x < obstacleBoxX + obstacleBox.width &&
    tRexBox.x + tRexBox.width > obstacleBoxX &&
    tRexBox.y < obstacleBox.y + obstacleBox.height &&
    tRexBox.height + tRexBox.y > obstacleBox.y
  ) {
    crashed = true
  }

  return crashed
}
