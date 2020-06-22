import React  from 'react';
import { ButtonToolbar, IconButton, Icon } from 'rsuite';
import '../../static/css/dataTable.less';
  
const DeleteButton = ({onClick}) => (
    <ButtonToolbar style={{marginTop: '20px', marginRight: '5px'}}>
        <IconButton 
            className="inner-right"
            color="red" 
            icon={<Icon icon="trash-o" />} 
            appearance="primary" 
            onClick={onClick}
        />
    </ButtonToolbar>

);

export default DeleteButton;
