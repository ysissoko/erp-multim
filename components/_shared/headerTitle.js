import React from 'react';

const HeaderTitle = ({ className, title, subtitle}) => (
        <div className={className}>
            <h3>{title}</h3>
            <h6 style={{fontWeight: 'lighter'}}>{subtitle}</h6>
        </div>
);

export default HeaderTitle;
