import React from 'react';
import { Table } from "rsuite";

import '../../static/css/dataTable.less';

const { Cell } = Table;

const EditCell = ({ rowData, dataKey, editing, onChange, ...props }) => {
    return (
      <Cell {...props} className={editing ? 'table-content-editing' : ''} >
        {rowData.status === 'EDIT' ? (
          <input
            className="rs-input edit-cell"
            defaultValue={rowData[dataKey]}
            onChange={event => {
              onChange && onChange(rowData.id, dataKey, event.target.value);
            }}
          />
        ) : (
          <span className="table-content-edit-span">{rowData[dataKey]}</span>
        )}
      </Cell>
    );
  };
  
  export default EditCell;