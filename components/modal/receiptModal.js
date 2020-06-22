import React from 'react';
import { Form, FormGroup, FormControl, ControlLabel, HelpBlock, Schema,
  Modal, Icon, Button, InputGroup, Input, Whisper, Tooltip, InputPicker, InputNumber} from 'rsuite';
import '../../static/css/modal.less'

const { NumberType } = Schema.Types;

const model = Schema.Model({
  name: NumberType('Veuillez entrer un chiffre')
  .isRequired('Le champs est obligatoire'),
  carton: NumberType('Veuillez entrer un chiffre')
    .isInteger('Veuillez entrer un nombre entier')
    .min(1, 'Vous pouvez créer au minimum 1 carton')
});

function TextField(props) {
  const { name, label, accepter, errorPlacement, ...rest } = props;
  return (
    <FormGroup>
      <FormControl name={name} accepter={accepter} errorPlacement={errorPlacement} {...rest} />
    </FormGroup>
  );
}

const ReceiptModal = ({ closeModal, text, secondaryButton, validateModal,primaryButton, providersList, handleCartonInputChange, handleSelectProvider, handleInvoiceNumberChange, disabled }) => (
    <>
    <Form model={model}>
    
    <Modal.Header>
      <h3>Nouvelle Réception</h3>
      <h6 style={{fontWeight:'lighter'}}>Créer un bon de réception</h6>
    </Modal.Header>

    <Modal.Body>

            <Icon icon="file-text" className="cs--icon"/>
            <label className="cs--label">Quel est le numéro de la facture ?</label>
          <br></br>
          <span className="cs--label-whin">WH / IN / </span>
          
          <TextField className="cs--input-whin" name="name" errorPlacement="bottomEnd" placeholder="27032020" onChange={handleInvoiceNumberChange}/>

          <Icon icon="user-info" className="cs--icon"/>
          <label className="cs--label">Quel est le fournisseur ?</label>
          <InputPicker className="cs--input" data={providersList} onSelect={handleSelectProvider}/>
         
          <hr></hr>

          <Icon icon="dropbox" className="cs--icon"/>
          Combien de carton souhaitez-vous créer ? (Option)
          <span className="cs--text-carton">Pour imprimer les codes barres, aller dans Stock > Carton.</span>
          <TextField name="carton" errorPlacement="rightEnd" className="cs--input-carton" placeholder="10" onChange={handleCartonInputChange} />

    </Modal.Body>

    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button onClick={validateModal} appearance="primary" color="blue" type="submit" disabled={disabled}>
        {primaryButton}
      </Button>
    </Modal.Footer>

    </Form>
    </>
  );

  export default ReceiptModal;