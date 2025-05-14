import { type Brick, type RobotConfig } from './types';

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
export function calculateNaiveBuildOrder(initialBricks: Brick[], _: RobotConfig): Brick[] {
    return deepCopy(initialBricks);
}

/**
 * Optimizes the build order of the wall bricks based on the robot's configuration to minimize the number
 * of 'strides', i.e., the number of times the robot has to move to a new position.
 * @param initialBricks List of bricks to be built in the wall
 * @param robotConfig Robot configuration
 * @returns List of bricks in the order they should be built
 */
export function calculateOptimizedBuildOrder(initialBricks: Brick[], robotConfig: RobotConfig): Brick[] {
    return deepCopy(initialBricks).reverse(); // placeholder
}