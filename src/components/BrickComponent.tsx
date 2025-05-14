import React from 'react';
import { type Brick } from '../core/types';

interface BrickProps {
    brick: Brick;
}

const BrickComponent: React.FC<BrickProps> = ({ brick }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: brick.x,
        bottom: brick.y,
        width: brick.width,
        height: brick.height,
        backgroundColor: brick.status === 'built' ? 'rgb(94, 94, 94)' : 'rgb(219, 219, 219)',
        border: '1px solid rgb(44, 44, 44)',
        boxSizing: 'border-box',
        fontSize: '10px',
        color: 'white',
        textAlign: 'center',
        lineHeight: `${brick.height}px`
    };

    return (
        <div style={style} title={`ID: ${brick.id}\nCourse: ${brick.course}\nIndex: ${brick.indexInCourse}`}></div>
    );
};

export default BrickComponent;