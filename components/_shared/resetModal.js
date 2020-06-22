import React from 'react';
import { Modal, Icon, Button, Tag } from 'rsuite';

const ResetModal = ({ closeModal, text, tagStatut, secondaryButton, primaryButton, validateModal }) => (
    <>
      <Modal.Header>
      <h3>Réinitialiser le statut</h3>
    </Modal.Header>
    <Modal.Body>
      <Icon icon="remind" style={{ color: '#ffb300', fontSize: 24, marginRight: '20px'}}/>
      {text} <Tag color="blue">{tagStatut}</Tag> ?
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button onClick={validateModal} appearance="primary" color="cyan">
        {primaryButton}
      </Button>
    </Modal.Footer>
    </>
  );

  export default ResetModal;