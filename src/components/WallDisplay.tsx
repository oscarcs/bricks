import React, { useState, useEffect, useCallback } from 'react';
import { type Brick, WALL_CONFIG, ROBOT_CONFIG, type BuildOrder, type BuildOrderStrategy } from '../core/types';
import { generateWall } from '../core/wallGenerator';
import { calculateNaiveBuildOrder, calculateOptimizedBuildOrder } from '../core/buildOptimizer';
import BrickComponent from './BrickComponent';

const buildOrderStrategies = {
    naive: calculateNaiveBuildOrder,
    optimized: calculateOptimizedBuildOrder,
} as const satisfies Record<BuildOrder, BuildOrderStrategy>;

const WallDisplay: React.FC = () => {
    const [initialWallBricks] = useState<Brick[]>(generateWall());
    const [sortedBrickOrder, setSortedBrickOrder] = useState<Brick[]>([]);
    const [bricksToDisplay, setBricksToDisplay] = useState<Brick[]>([]);
    const [builtBricksCount, setBuiltBricksCount] = useState(0);
    const [scale, setScale] = useState(1);
    const [buildMode, setBuildMode] = useState<'naive' | 'optimized'>('optimized');

    useEffect(() => {
        const strategy = buildOrderStrategies[buildMode];
        const order = strategy(initialWallBricks, ROBOT_CONFIG);
        setSortedBrickOrder(order);
        
        const initialDisplayState = order.map(optimizedBrick => {
            return {
                ...optimizedBrick,
                status: 'planned' as const
            };
        });
        setBricksToDisplay(initialDisplayState);
        setBuiltBricksCount(0);
    }, [initialWallBricks, buildMode]);

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
            <h3>Masonry Wall Build Plan</h3>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button onClick={() => setBuildMode('naive')} disabled={buildMode === 'naive'}>
                    Naive Order
                </button>
                <button onClick={() => setBuildMode('optimized')} disabled={buildMode === 'optimized'}>
                    Optimized Order
                </button>
            </div>
            <p>Press ENTER to build the next brick in the {buildMode} order.<br />Hover for brick info.</p>
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