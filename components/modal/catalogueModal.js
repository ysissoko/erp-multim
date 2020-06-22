import React from 'react';
import { Modal, Uploader, Button, Icon } from 'rsuite';
import '../../static/css/modal.less'

const styles = {
  lineHeight: '200px'
};

const CatalogueModal = ({ closeModal, text, secondaryButton, primaryButton, validateModal, handleUploadExcelFile, disabled }) => (
    <>
    <Modal.Header>
      <h3>Importer un catalogue</h3>
      <h6 className="cs--subtitle">Ajouter de nouveaux produits</h6>
    </Modal.Header>
    <Modal.Body>
        <Uploader action="//jsonplaceholder.typicode.com/posts/" onUpload={handleUploadExcelFile} dragable autoUpload={true} accept=".xlsx">
          <div style={styles}>Cliquez ou Déposez un fichier Excel</div>
        </Uploader>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button disabled={disabled} onClick={validateModal} appearance="primary" color="blue">
        {primaryButton}
      </Button>
    </Modal.Footer>
    </>
  );

  export default CatalogueModal;