import React from 'react';
import { Modal, Icon, Button } from 'rsuite';

const ConfirmModal = ({ header, closeModal, text, handleConfirm, secondaryButton, primaryButton }) => (
    <>
      <Modal.Header>
      <h3>{ header || "Supprimer" }</h3>
    </Modal.Header>
    <Modal.Body>
      <Icon icon="remind" style={{ color: '#ffb300', fontSize: 24, marginRight: '20px'}}/>
      {text}
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button onClick={handleConfirm} appearance="primary" color="red">
        {primaryButton}
      </Button>
    </Modal.Footer>
    </>
  );

  export default ConfirmModal;