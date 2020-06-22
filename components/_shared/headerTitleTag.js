import React from 'react';
import { Tag, List } from 'rsuite';
import '../../static/css/toolbar.less';

const HeaderTitleTag = ({
    className,
    title,
    status,
    label,
    createOn,
    batch,
    orderNum,
    orderDate,
    type,
    name,
    phone,
    street,
    city,
    country
    }) => (
    <>
        <div className={className}>
            <h3>{title}</h3>
            <Tag color="blue" style={{marginTop: '10px', marginLeft: '10px'}}> {status.toUpperCase()} </Tag>
        </div>
        <div className="date">
            <h6>{createOn}</h6>
        </div>
        <div className="table-toolbar details" style={{padding: '20px'}}>
        <List size='sm'>
            {label.map((l) =>
            <List.Item key={l.datakey} index={l}>
                {l.text}
                <h6>
                    {l.datakey === "batch" ? batch
                    : l.datakey === "orderNum" ? orderNum
                    : l.datakey === "createDate" ? createOn
                    : l.datakey === "orderDate" ? orderDate
                    : l.datakey === "type" ? type
                    : l.datakey === "name" ? name
                    : l.datakey === "phone" ? phone
                    : l.datakey === "street" ? street
                    : l.datakey === "city" ? city
                    : l.datakey === "country" ? country
                    : "N/A"
                    }
                </h6>
            </List.Item>
            )}
        </List>
        </div>
    </>
);


export default HeaderTitleTag;
