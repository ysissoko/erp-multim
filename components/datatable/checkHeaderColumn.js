import React from 'react';
import { Checkbox, Table } from "rsuite";

const { HeaderCell } = Table;

const CheckHeaderColumn = ({ checked, disabled, indeterminate, onChange, ...props }) => {
  return (
    <HeaderCell {...props} style={{ padding: 0 }}>
    <div style={{ lineHeight: '40px' }}>
      <Checkbox
        inline
        disabled={disabled}
        checked={checked}
        indeterminate={indeterminate}
        onChange={onChange}/>
    </div>
  </HeaderCell>
  )
}

export default CheckHeaderColumn;