import React from 'react';
import { Modal, Button, Icon, RadioGroup, Radio, FormGroup } from 'rsuite';
import '../../static/css/modal.less'

const choiceModal = ({ title, subtitle, primaryButton, secondaryButton, closeModal, onExportModelChange, validateModal, disabled }) => (
    <>
    <Modal.Header>
      <h3>{title}</h3>
      <h6 className="cs--subtitle">{subtitle}</h6>
    </Modal.Header>

    <Modal.Body>
      <Icon style={{marginTop:'15px'}} icon="file-upload" className="cs--icon"/>
      <label className="cs--label">Sous quelle forme souhaitez-vous exporter ?</label>
      <FormGroup controlId="radioList" style={{marginBottom:'15px', marginLeft:'27px'}}>
        <RadioGroup name="radioList" defaultValue={true} onChange={onExportModelChange} inline>
          <Radio value={true} defaultChecked={true}>Trié</Radio>
          <Radio value={false}>Non Trié</Radio>
        </RadioGroup>
      </FormGroup>

    </Modal.Body>

    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button disabled={disabled} type="submit" onClick={validateModal} appearance="primary" color="blue">
        {primaryButton}
      </Button>
    </Modal.Footer>
    </>
  );

  export default choiceModal;