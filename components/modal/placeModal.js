import React from 'react';
import { Modal, Uploader, Button, Input, Form, FormGroup, Icon, ControlLabel, Schema, FormControl } from 'rsuite';

const { StringType, NumberType } = Schema.Types;

const model = Schema.Model({
  name: StringType().isRequired('Veuillez inscrire le code de votre emplacement')
});

function TextField(props) {
  const { name, label, accepter, errorMessage, errorPlacement, ...rest } = props;


  return (
    <FormGroup>
      <FormControl name={name} accepter={accepter} errorPlacement={errorPlacement} errorMessage={errorMessage} {...rest} />
    </FormGroup>
  );
}

const placeModal = ({ closeModal, placeholder, secondaryButton, primaryButton, onInputChange, validateModal, disabled }) => (
    <>
    <Form model={model}>
    <Modal.Header>
      <h3>Nouveau Emplacement</h3>
      <h6 className="cs--subtitle">Créer un ou plusieurs emplacement(s)</h6>
    </Modal.Header>
    <Modal.Body>

      <Icon icon="map-signs" className="cs--icon"/>
      <label className="cs--label">Quel est le code de l’emplacement ?</label>
      <TextField  name="name" errorPlacement="bottomEnd" className="cs--input" placeholder={placeholder} onChange={onInputChange} />

      <Icon icon="file-upload" className="cs--icon"/>
      <label>J'importe un fichier excel (Option)</label>
      <Uploader className="cs--uploader" action="//jsonplaceholder.typicode.com/posts/" dragable>
        <div className="cs--uploader">Cliquez ou Déposez un fichier Excel </div>
      </Uploader>

    </Modal.Body>
    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button disabled={disabled} onClick={validateModal} type="submit" appearance="primary" color="blue">
        {primaryButton}
      </Button>
    </Modal.Footer>
    </Form>
    </>
  );

  export default placeModal;