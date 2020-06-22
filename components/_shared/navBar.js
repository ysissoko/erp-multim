import React, {Component} from 'react';
import { Nav } from 'rsuite';
import '../../static/css/dataTable.less';
  
const NavBar = ({ items, active, onSelect, ...props }) => {
  return items.map(i => {
      return (
        <Nav key={i.key} {...props} activeKey={active} onSelect={onSelect}>
          <Nav.Item eventKey={i.key}>
              {i.text}
          </Nav.Item>
        </Nav>
    );
  });  
};

export default NavBar;
