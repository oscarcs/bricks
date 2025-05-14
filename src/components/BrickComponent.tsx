import React from 'react';
import { type Brick } from '../core/types';

interface BrickProps {
    brick: Brick;
    scale: number;
}

const BrickComponent: React.FC<BrickProps> = ({ brick, scale }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: brick.x * scale,
        bottom: brick.y * scale,
        width: brick.width * scale,
        height: brick.height * scale,
        backgroundColor: brick.status === 'built' ? 'rgb(94, 94, 94)' : 'rgb(219, 219, 219)',
        border: '1px solid rgb(44, 44, 44)',
        boxSizing: 'border-box',
        fontSize: '10px',
        color: 'white',
        textAlign: 'center',
        lineHeight: `${brick.height * scale}px`
    };

    return (
        <div style={style} title={`ID: ${brick.id}\nCourse: ${brick.course}\nIndex: ${brick.indexInCourse}`}></div>
    );
};

export default BrickComponent;