import React from 'react';
import { type Brick } from '../core/types';

interface BrickProps {
    brick: Brick;
    scale: number;
}

function getStrideColor(stride: number): string {
    const hue = (stride * 43) % 360;
    return `hsl(${hue}, 60%, 50%)`;
}

const BrickComponent: React.FC<BrickProps> = ({ brick, scale }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: brick.x * scale,
        bottom: brick.y * scale,
        width: brick.width * scale,
        height: brick.height * scale,
        backgroundColor: brick.status === 'built' ? getStrideColor(brick.stride) : 'rgb(219, 219, 219)',
        border: '1px solid rgb(44, 44, 44)',
        boxSizing: 'border-box',
        fontSize: '10px',
        color: 'white',
        textAlign: 'center',
        lineHeight: `${brick.height * scale}px`
    };

    return (
        <div style={style} title={`ID: ${brick.id}\nCourse: ${brick.course}\nIndex: ${brick.indexInCourse}\nStride: ${brick.stride}`}></div>
    );
};

export default BrickComponent;