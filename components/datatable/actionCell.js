import React, {Component} from 'react';
import { Table, Whisper, Divider, IconButton, Icon, Popover, Dropdown, Button } from "rsuite";

const { Cell } = Table;

let tableBody;

const Menu = ({ onSelect }) => (
  <Dropdown.Menu onSelect={onSelect}>
    <Dropdown.Item eventKey={"pdf"}>Download PDF</Dropdown.Item>
    <Dropdown.Item eventKey={"excel"}>Export EXCEL</Dropdown.Item>

    {/* <Dropdown.Item
      eventKey={"edit"}
      onClick={() => {
        onClick && onClick(rowData.id);
        console.log("on click", rowData.id)}
      }>
        {rowData.status === 'EDIT' ? 'Save' : 'Edit'}
    </Dropdown.Item> */}

    <Dropdown.Item eventKey={"delete"}>Delete</Dropdown.Item>
  </Dropdown.Menu>
);

const MenuPopover = ({ onSelect, ...rest }) => (
<Popover {...rest} full>
  <Menu onSelect={onSelect} />
</Popover>
);

class CustomWhisper extends Component {

  handleSelectMenu = (eventKey, event) => {
    console.log(eventKey);
    this.trigger.hide();
  }

  render() {

    return (
      <Whisper
        placement="autoVerticalStart"
        trigger="click"
        triggerRef={ref => {
          this.trigger = ref;
        }}
        container={() => {
          return tableBody;
        }}
        speaker={<MenuPopover onSelect={this.handleSelectMenu} />}
      >
        {this.props.children}
      </Whisper>
    );
  }
}

const ActionCell = ({ rowData, dataKey, onClick, onRowClick, editing, moreActions, plusActions, ...props }) => {

  function handleAction() {
    console.log(`id:${rowData[dataKey]}`);
    console.log(JSON.stringify(rowData));
    console.log(dataKey === "operation");
  }


  return (
    <Cell {...props} className="link-group" style={{ padding: '6px 0' }}>
    {editing && (
      <Button
        appearance="link"
        onClick={() => {
          onClick && onClick(rowData);
        }}
      >
        {rowData.status === 'EDIT' ? 'Enregistré' : 'Modifier'}
      </Button>
    )}
    {moreActions && (
      <>
      <IconButton
            appearance="subtle"
            onClick={onRowClick}
            //onClick={handleAction}
            icon={<Icon icon="eye" />}
          />
        {plusActions && (
          <>
          <Divider vertical />
          <CustomWhisper>
            <IconButton
              appearance="subtle"
              icon={<Icon icon="more"
              //onClick={handleAction}
              />}
            />
          </CustomWhisper>
          </>
          )}
          </>
        )}
    </Cell>
  );
};

export default ActionCell;