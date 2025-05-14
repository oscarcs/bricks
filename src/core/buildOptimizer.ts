import { WALL_CONFIG, type Brick, type RobotConfig } from './types';

function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Just build the wall up course by course from the bottom to the top.
 * This is a naive approach and does not consider the robot's envelope size.
 * @param initialBricks List of bricks to be built in the wall
 * @param robotConfig Robot configuration
 * @returns List of bricks in the order they should be built
 */
export function calculateNaiveBuildOrder(initialBricks: Brick[], robotConfig: RobotConfig): Brick[] {
    const allBricks = deepCopy(initialBricks);
    const { envelopeWidth } = robotConfig;
    const { width: wallWidth } = WALL_CONFIG;
    const buildOrder: Brick[] = [];
    let strideCounter = 0;

    // Build course by course, sliding window across width
    const courses = Array.from(new Set(allBricks.map(b => b.course))).sort((a, b) => a - b);
    for (const course of courses) {

        let unassigned = allBricks.filter(b => b.course === course);
        let robotX = 0;
        
        while (unassigned.length > 0) {
            // Bricks within the current window
            const windowBricks = unassigned.filter(b =>
                b.x + b.width > robotX && b.x < robotX + envelopeWidth
            );
            
            if (windowBricks.length === 0) {
                // Move to next unassigned brick
                const next = unassigned.sort((a, b) => a.x - b.x)[0];
                robotX = Math.max(0, Math.min(next.x, wallWidth - envelopeWidth));
                continue;
            }
            
            windowBricks.sort((a, b) => a.x - b.x);
            for (const brick of windowBricks) {
                brick.stride = strideCounter;
                buildOrder.push(brick);
            }
            
            // Remove assigned
            unassigned = unassigned.filter(b => b.stride === -1);
            
            // Reposition for next window
            const next = unassigned.sort((a, b) => a.x - b.x)[0];
            if (next) {
                robotX = Math.max(0, Math.min(next.x, wallWidth - envelopeWidth));
                strideCounter++;
            }
        }
    }
    return buildOrder;
}

/**
 * Optimizes the build order of the wall bricks based on the robot's configuration to minimize the number
 * of 'strides', i.e., the number of times the robot has to move to a new position.
 * @param initialBricks List of bricks to be built in the wall
 * @param robotConfig Robot configuration
 * @returns List of bricks in the order they should be built
 */
export function calculateOptimizedBuildOrder(initialBricks: Brick[], robotConfig: RobotConfig): Brick[] {
    const allBricks = deepCopy(initialBricks);
    // Initialize stride property
    allBricks.forEach(b => b.stride = 0);
    let strideCounter = 0;
    const builtBrickIds = new Set<string>();
    const buildOrder: Brick[] = [];

    // Bottom-left corner of the robot envelope
    let robotCurrentX = 0;
    let robotCurrentY = 0;

    const { envelopeWidth, envelopeHeight } = robotConfig;
    const { width: wallWidth, height: wallHeight } = WALL_CONFIG;

    while (builtBrickIds.size < allBricks.length) {
        let bricksBuiltInThisStrideIteration = 0;
        let madeProgressInEnvelopeIteration: boolean;

        // Try to build as many bricks as possible in the current stride
        do {
            madeProgressInEnvelopeIteration = false;
            
            const bricksInPotentialEnvelope = allBricks.filter(b =>
                !builtBrickIds.has(b.id) &&
                b.x + b.width > robotCurrentX && b.x < robotCurrentX + envelopeWidth &&
                b.y + b.height > robotCurrentY && b.y < robotCurrentY + envelopeHeight
            );

            bricksInPotentialEnvelope.sort((a, b) => {
                if (a.course !== b.course) return a.course - b.course;
                return a.x - b.x;
            });

            for (const brick of bricksInPotentialEnvelope) {
                if (!builtBrickIds.has(brick.id) && isBrickBuildable(brick, builtBrickIds, allBricks)) {
                    brick.stride = strideCounter;
                    buildOrder.push(brick);
                    builtBrickIds.add(brick.id);
                    bricksBuiltInThisStrideIteration++;
                    madeProgressInEnvelopeIteration = true;
                }
            }
        } while (madeProgressInEnvelopeIteration);

        // If no bricks were built in this attempt, we need to reposition the robot
        if (bricksBuiltInThisStrideIteration === 0 && builtBrickIds.size < allBricks.length) {   
            const remainingUnbuiltBricks = allBricks.filter(b => !builtBrickIds.has(b.id));
            
            const candidateBricksForNextStride = remainingUnbuiltBricks
                .filter(b => isBrickBuildable(b, builtBrickIds, allBricks))
                .sort((a, b) => a.course - b.course || a.x - b.x);

            if (candidateBricksForNextStride.length === 0) {
                // As a last resort, pick the lowest, leftmost unbuilt brick. This might not be ideal.
                const emergencyTarget = remainingUnbuiltBricks.sort((a, b) => a.course - b.course || a.x - b.x)[0];
                if (emergencyTarget) {
                    robotCurrentX = Math.max(0, Math.min(emergencyTarget.x, wallWidth - envelopeWidth));
                    robotCurrentY = Math.max(0, Math.min(emergencyTarget.y, wallHeight - envelopeHeight));
                    strideCounter++;
                }
                else {
                    // No bricks left
                    break;
                }

                // Retry building
                continue;
            }

            let bestNextRobotX = -1;
            let bestNextRobotY = -1;
            let maxBricksInNextPotentialStride = -1;

            // This is a greedy approach: we're only considering the first few (low, buildable) candidate bricks
            const targetCandidates = candidateBricksForNextStride.slice(0, Math.min(candidateBricksForNextStride.length, 5));

            for (const targetBrick of targetCandidates) {
                // For each candidate consider different anchors for the robot envelope
                const potentialPositions = [
                    // Bottom-left corners of the envelope and brick are aligned
                    { x: targetBrick.x, y: targetBrick.y }, 
                    // Center envelope over brick in x
                    { x: targetBrick.x + targetBrick.width / 2 - envelopeWidth / 2, y: targetBrick.y },
                    // Bottom-right corners of the envelope and brick are aligned
                    { x: targetBrick.x + targetBrick.width - envelopeWidth, y: targetBrick.y },
                    // Center envelope over brick in y
                    { x: targetBrick.x, y: targetBrick.y + targetBrick.height / 2 - envelopeHeight / 2 },
                ];

                // For each candidate window, score it by how many bricks it can cover in the next stride
                for (const pos of potentialPositions) {
                    const currentPotentialRobotX = Math.max(0, Math.min(pos.x, wallWidth - envelopeWidth));
                    const currentPotentialRobotY = Math.max(0, Math.min(pos.y, wallHeight - envelopeHeight));

                    let count = 0;
                    
                    for (const b of candidateBricksForNextStride) {
                        if (b.x + b.width > currentPotentialRobotX && b.x < currentPotentialRobotX + envelopeWidth &&
                            b.y + b.height > currentPotentialRobotY && b.y < currentPotentialRobotY + envelopeHeight) {
                            count++;
                        }
                    }

                    if (count > maxBricksInNextPotentialStride) {
                        maxBricksInNextPotentialStride = count;
                        bestNextRobotX = currentPotentialRobotX;
                        bestNextRobotY = currentPotentialRobotY;
                    }
                }
            }

            // If we found a better position, move the robot there
            if (bestNextRobotX !== -1 && maxBricksInNextPotentialStride > 0) {
                robotCurrentX = bestNextRobotX;
                robotCurrentY = bestNextRobotY;
                strideCounter++;
            }
            else {
                // If no strategic move found, just move to the first candidate brick
                const fallbackTarget = candidateBricksForNextStride[0];
                if (fallbackTarget) {
                    robotCurrentX = Math.max(0, Math.min(fallbackTarget.x + fallbackTarget.width / 2 - envelopeWidth / 2, wallWidth - envelopeWidth));
                    robotCurrentY = Math.max(0, Math.min(fallbackTarget.y, wallHeight - envelopeHeight));
                    strideCounter++;
                }
                else {
                    // No bricks left
                    break;
                }
            }
        }
    }
    return buildOrder;
}

// Helper to get bricks that support the current brick
function getSupportingBricks(brick: Brick, allBricks: Brick[]): Brick[] {
    if (brick.course === 0) {
        return [];
    }

    // Look for bricks in the course below that overlap horizontally with the current brick
    // ░░░░ ▓▓▓▓ ░░░░ ░░
    // ░░ ▓▓▓▓ ▓▓▓▓ ░░░░
    return allBricks.filter(s =>
        s.course === brick.course - 1 &&
        s.x < brick.x + brick.width &&   
        s.x + s.width > brick.x
    );
}

// Helper to check if a brick can be built
function isBrickBuildable(brick: Brick, builtBrickIds: Set<string>, allBricks: Brick[]): boolean {
    if (brick.course === 0) {
        return true;
    }

    const supporters = getSupportingBricks(brick, allBricks);

    // Degenerate case where the brick is not in the first course but somehow has no supporters
    if (supporters.length === 0 && brick.course > 0) {
        return false;
    }

    // All the identified supporters must be built
    return supporters.every(s => builtBrickIds.has(s.id));
}