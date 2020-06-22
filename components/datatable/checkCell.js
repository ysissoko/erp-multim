import React from 'react';
import { Table, Checkbox } from "rsuite";

const { Cell } = Table;

const CheckCell = ({ rowData, onChange, checkedKeys, disabled, dataKey, ...props }) => {
  return (
   <Cell {...props} style={{ padding: 0 }}>
      <div style={{ lineHeight: '46px' }}>
        <Checkbox
          value={rowData[dataKey]}
          inline
          disabled={disabled}
          onChange={onChange}
          checked={checkedKeys.some(item => item === rowData[dataKey])}
        />
      </div>
    </Cell>
  )
  };

export default CheckCell;