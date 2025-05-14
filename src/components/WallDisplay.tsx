import React, { useState, useEffect, useCallback } from 'react';
import { type Brick, WALL_CONFIG, ROBOT_CONFIG } from '../core/types';
import { generateWall } from '../core/wallGenerator';
import { calculateNaiveBuildOrder } from '../core/buildOptimizer';
import BrickComponent from './BrickComponent';

const WallDisplay: React.FC = () => {
    const [initialWallBricks] = useState<Brick[]>(generateWall());
    const [sortedBrickOrder, setSortedBrickOrder] = useState<Brick[]>([]);
    const [bricksToDisplay, setBricksToDisplay] = useState<Brick[]>([]);
    const [builtBricksCount, setBuiltBricksCount] = useState(0);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const order = calculateNaiveBuildOrder(initialWallBricks, ROBOT_CONFIG);
        setSortedBrickOrder(order);
        
        // Initialize display bricks with all as 'planned' but ordered by optimizer
        // We need to map the status from the initialWallBricks to the optimizedOrder
        const initialDisplayState = order.map(optimizedBrick => {
            const originalBrick = initialWallBricks.find(b => b.id === optimizedBrick.id);
            return {
                ...optimizedBrick, // Takes x, y, width, height, type, course, indexInCourse from optimizer (should be same)
                status: originalBrick?.status || 'planned' // Ensures initial status is planned
            };
        });
        setBricksToDisplay(initialDisplayState);
    }, [initialWallBricks]);

    useEffect(() => {
        const calculateScale = () => {
            const viewportWidth = window.innerWidth * 0.8;
            const viewportHeight = window.innerHeight * 0.8;

            const widthScale = viewportWidth / WALL_CONFIG.width;
            const heightScale = viewportHeight / WALL_CONFIG.height;
            
            setScale(Math.min(widthScale, heightScale));
        };

        calculateScale(); 
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    const buildNextBrick = useCallback(() => {
        if (builtBricksCount < sortedBrickOrder.length) {
            setBricksToDisplay(prevBricks =>
                prevBricks.map(brick =>
                    brick.id === sortedBrickOrder[builtBricksCount].id
                        ? { ...brick, status: 'built' }
                        : brick
                )
            );
            setBuiltBricksCount(prevCount => prevCount + 1);
        }
    }, [builtBricksCount, sortedBrickOrder]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                buildNextBrick();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [buildNextBrick]);

    const wallStyle: React.CSSProperties = {
        position: 'relative',
        width: WALL_CONFIG.width * scale,
        height: WALL_CONFIG.height * scale,
        border: '1px solid black',
        margin: '20px auto',
    };

    const wallContainerStyle: React.CSSProperties = {
        width: WALL_CONFIG.width * scale + 40, // Add some padding
        margin: '0 auto',
    };

    // Render all bricks from initialWallBricks to show the full planned wall,
    // but their status (color) will be updated based on bricksToDisplay (which follows optimized order)
    const displayBricks = initialWallBricks.map(initialBrick => {
        const displayVersion = bricksToDisplay.find(b => b.id === initialBrick.id);
        return displayVersion || initialBrick; // (Fallback to initialBrick)
    });

    return (
        <div style={wallContainerStyle}>
            <h2>Masonry Wall Build Plan</h2>
            <p>Press ENTER to build the next brick in the optimized order.</p>
            <p>Built bricks: {builtBricksCount} / {sortedBrickOrder.length}</p>
            <div style={wallStyle}>
                {displayBricks.map(brick => (
                    <BrickComponent key={brick.id} brick={brick} scale={scale} />
                ))}
            </div>
        </div>
    );
};

export default WallDisplay;