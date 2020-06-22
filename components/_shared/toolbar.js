import React from 'react';
import '../../static/css/toolbar.less';

import { ButtonToolbar, Icon, Button} from 'rsuite';

const Toolbar = ({ importModal, primaryButton}) => (
  <>
    <ButtonToolbar style={{marginTop: '20px'}} className="inner-right">
        <Button
          color="blue"
          appearance="primary"
          onClick={importModal}>
          <Icon 
            icon="plus"
            style={{marginRight: '5px'}}/> 
          {primaryButton}
        </Button>
  </ButtonToolbar>
</>
);
export default Toolbar;