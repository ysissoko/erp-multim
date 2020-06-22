import React from 'react';

import '../../static/css/toolbar.less';

import { Tag } from 'rsuite';
import { getTagByReceiptStatus } from '../../utils/date';

const HeaderTitleTagWhIn = ({ receipt, label }) => (
    <>
        <div className="table-toolbar header-tag">
            <h3>{receipt.refCode}</h3>
            <Tag color="blue" style={{marginTop: '10px', marginLeft: '10px'}}> {getTagByReceiptStatus(receipt.status).toUpperCase() } </Tag>
        </div>
        <div className="table-toolbar details">
            <ul>
                {label.map((l) => {
                    return (
                        <li><h6 className="label">{l.text}</h6></li>
                    )}
                )}
            </ul>
        </div>
    </>
);


export default HeaderTitleTagWhIn;
