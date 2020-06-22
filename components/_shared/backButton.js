import React from 'react';
import { Icon, Button, ButtonToolbar } from 'rsuite';
import '../../static/css/dataTable.less';

const BackButton = ({ onClick, label, }) => (
        <Button color="blue" appearance="ghost" onClick={onClick} >
            <Icon icon="long-arrow-left" style={{marginRight: '5px'}}/>
            {label}
        </Button>
  );

  export default BackButton;