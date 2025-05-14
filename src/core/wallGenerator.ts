import { type Brick, WALL_CONFIG } from './types';

export function generateWall(): Brick[] {
    const bricks: Brick[] = [];
    const {
        width: wallWidth,
        height: wallHeight,
        fullBrickLength,
        halfBrickLength,
        brickHeight,
        headJoint,
        courseHeight
    } = WALL_CONFIG;

    const numCourses = Math.ceil(wallHeight / courseHeight);

    for (let i = 0; i < numCourses; i++) {
        let currentX = 0;
        const y = i * courseHeight;
        const isEvenCourse = i % 2 === 0;
        let brickIndexInCourse = 0;

        // Odd courses start with a half brick
        if (!isEvenCourse) {
            const halfBrick: Brick = {
                id: `brick-${i}-0`,
                x: currentX,
                y,
                width: halfBrickLength,
                height: brickHeight,
                type: 'half',
                status: 'planned',
                course: i,
                indexInCourse: brickIndexInCourse++,
                stride: -1,
            };
            bricks.push(halfBrick);
            currentX += halfBrickLength + headJoint;
        }

        while (currentX < wallWidth) {
            const remainingWidth = wallWidth - currentX;
            let brickLength = fullBrickLength;
            let brickType: 'full' | 'half' = 'full';

            if (remainingWidth < fullBrickLength + (currentX > 0 ? headJoint : 0) && remainingWidth >= halfBrickLength) {
                // If a full brick doesn't fit but a half brick might (or is needed to finish)
                if (remainingWidth < fullBrickLength && remainingWidth >= halfBrickLength) {
                    brickLength = halfBrickLength;
                    brickType = 'half';
                }
                else if (remainingWidth < halfBrickLength) {
                    // Not enough space for even a half brick
                    break;
                }
            }
            else if (remainingWidth < halfBrickLength) {
                // Not enough space for even a half brick
                break;
            }

            // Check if we need to trim the last brick to fit the wall width exactly
            if (currentX + brickLength > wallWidth) {
                if (currentX + halfBrickLength <= wallWidth && brickType === 'full') {
                    // If a half brick fits better than the current full brick
                    brickLength = halfBrickLength;
                    brickType = 'half';
                }
                else {
                    // Adjust the last brick's width if it's a full brick or a necessary half brick
                    brickLength = wallWidth - currentX;
                    if (brickLength < halfBrickLength / 2) break; // Avoid tiny slivers
                }
            }

            const brick: Brick = {
                id: `brick-${i}-${brickIndexInCourse}`,
                x: currentX,
                y,
                width: brickLength,
                height: brickHeight,
                type: brickType,
                status: 'planned',
                course: i,
                indexInCourse: brickIndexInCourse++,
                stride: -1,
            };
            bricks.push(brick);

            currentX += brickLength;
            if (currentX < wallWidth) {
                currentX += headJoint;
            }
        }

        // Adjust last brick of odd courses if it's a half brick and wall ends with full brick pattern
        if (!isEvenCourse) {
            const courseBricks = bricks.filter(b => b.course === i);
            const lastBrickInCourse = courseBricks[courseBricks.length - 1];
            if (lastBrickInCourse && lastBrickInCourse.type === 'half') {
                const previousBrick = courseBricks[courseBricks.length - 2];
                if (previousBrick && (previousBrick.x + previousBrick.width + headJoint + fullBrickLength <= wallWidth)) {
                    // remove the last half brick
                    bricks.pop();
                    brickIndexInCourse--;
                    
                    // update currentX
                    currentX = previousBrick.x + previousBrick.width + headJoint;
                    
                    // add a full brick
                    const fullBrick: Brick = {
                        id: `brick-${i}-${brickIndexInCourse}`,
                        x: currentX,
                        y,
                        width: fullBrickLength,
                        height: brickHeight,
                        type: 'full',
                        status: 'planned',
                        course: i,
                        indexInCourse: brickIndexInCourse++,
                        stride: -1,
                    };
                    bricks.push(fullBrick);

                    currentX += fullBrickLength + headJoint;
                }
            }
        }
    }
    return bricks;
}