import { type Brick, type RobotConfig } from './types';

/**
 * Just build the wall up course by course from the bottom to the top.
 * This is a naive approach and does not consider the robot's envelope size.
 * @param initialBricks List of bricks to be built in the wall
 * @param robotConfig Robot configuration
 * @returns List of bricks in the order they should be built
 */
export function calculateNaiveBuildOrder(initialBricks: Brick[], _: RobotConfig): Brick[] {
    return initialBricks;
}