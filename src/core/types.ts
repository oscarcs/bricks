export interface Brick {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'full' | 'half';
    status: 'planned' | 'built';
    course: number;
    indexInCourse: number; // Index of the brick within its course
}

export interface WallConfig {
    width: number;
    height: number;
    fullBrickLength: number;
    halfBrickLength: number;
    brickHeight: number;
    headJoint: number;
    bedJoint: number;
    courseHeight: number;
}

export interface RobotConfig {
    envelopeWidth: number;
    envelopeHeight: number;
}

export type BuildOrder = 'naive' | 'optimized';
export type BuildOrderStrategy = (initialBricks: Brick[], robotConfig: RobotConfig) => Brick[];

// Wall configuration, metrics in mm
export const WALL_CONFIG: WallConfig = {
    width: 2300,
    height: 2000,
    fullBrickLength: 210,
    halfBrickLength: 100,
    brickHeight: 50,
    headJoint: 10,
    bedJoint: 12.5,
    courseHeight: 50 + 12.5, // i.e. 62.5
};

// Robot configuration, metrics in mm
export const ROBOT_CONFIG: RobotConfig = {
    envelopeWidth: 800,
    envelopeHeight: 1300,
};