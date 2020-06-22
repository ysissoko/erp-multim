import React from 'react';

import '../../static/css/toolbar.less';

import { Tag, List, Panel } from 'rsuite';
import { getFormattedDate, getTagByDeliveryStatus, getTagStatusColor } from "../../utils/date"

const HeaderTitleTagWhOut = ({ delivery, label }) => (
    <>
        <div className="table-toolbar header-tag">
            <h3>{delivery.refCode}</h3>
            <Tag color={getTagStatusColor(delivery.status)} style={{marginTop: '10px', marginLeft: '10px'}}> {getTagByDeliveryStatus(delivery.status).toUpperCase()} </Tag>
        </div>
        <div className="date">
            <h6>{getFormattedDate(delivery.createdAt)}</h6>
        </div>
        <div className="table-toolbar details" style={{padding: '20px'}}>
        <Panel header="Information du client" collapsible bordered defaultExpanded={true}>
        <div className="inner-left">
            <List size='sm'>
                {label.map((l) =>
                <List.Item key={l.datakey} index={l}>
                    <h7>{l.text}</h7>
                    <h6 style={{fontWeight:'normal'}}>
                        {l.datakey === "batch" ? delivery.batch.refCode
                        : l.datakey === "orderNum" ? delivery.orderNum
                        : l.datakey === "createDate" ? getFormattedDate(delivery.createdAt)
                        : l.datakey === "orderDate" ? getFormattedDate(delivery.orderDate)
                        : l.datakey === "type" ? delivery.type
                        : l.datakey === "name" ? delivery.clientName
                        : l.datakey === "phone" ? delivery.clientTel
                        : l.datakey === "street" ? delivery.clientAddress
                        : l.datakey === "city" ? delivery.clientCity
                        : l.datakey === "country" ? delivery.clientCountry
                        : "N/A"
                        }
                    </h6>
                </List.Item>
                )}
            </List>
            </div>
        </Panel>

        </div>
    </>
);


export default HeaderTitleTagWhOut;
