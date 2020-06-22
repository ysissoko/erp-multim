import React from 'react';

import '../../static/css/toolbar.less';

import { Tag } from 'rsuite';

import { getTagStatusColor } from '../../utils/date';

const HeaderTitleCarton = ({ className, title, status, operation, place}) => (
    <>
        <div className={className}>
            <h3>{title}</h3>
            <Tag color={getTagStatusColor(status)} style={{marginTop: '10px', marginLeft: '10px'}}> {status.toUpperCase()} </Tag>
        </div>
        <div className="date">
         <h6>Opération: {operation}</h6>
         <h6>Place: {place}</h6>
        </div>
    </>
);


export default HeaderTitleCarton;
