import React from 'react';
import { Modal, Uploader, Button, Input, Icon, RadioGroup, Radio, FormGroup, Form, FormControl , Schema} from 'rsuite';
import '../../static/css/modal.less'

const { NumberType } = Schema.Types;

const model = Schema.Model({
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


const deliveryModal = ({
  closeModal,
  placeholder,
  secondaryButton,
  primaryButton,
  validateModal,
  handleDeliveryTypeChange,
  handleUploadExcelFile,
  handleCartonOutCountChange,
  disabled,
  deliveryType
 }) => (
    <>
    <Form model={model}>
    <Modal.Header>
      <h3>Bon de Préparation</h3>
      <h6 className="cs--subtitle">Créer un bon de préparation</h6>
    </Modal.Header>

    <Modal.Body>
      <Icon icon="file-upload" className="cs--icon"/>
      <label className="cs--label">J'importe le fichier de commandes</label>
      <Uploader className="cs--uploader" onChange={handleUploadExcelFile} multiple={false} dragable autoUpload={false} accept=".xlsx">
        <div className="cs--uploader">Cliquez ou Déposez un fichier Excel </div>
      </Uploader>

      <Icon style={{marginTop:'15px'}} icon="file-upload" className="cs--icon"/>
      <label className="cs--label">Quel est le type de commande ?</label>
      <FormGroup controlId="radioList" style={{marginBottom:'15px', marginLeft:'27px'}}>
        <RadioGroup name="radioList" defaultValue="classic" onChange={handleDeliveryTypeChange} inline>
          <Radio value="classic" defaultChecked={true}>Classique</Radio>
          <Radio value="dropshipping">Dropshipping</Radio>
        </RadioGroup>
      </FormGroup>

    {deliveryType === "classic" && (
      <>
      <Icon icon="dropbox" className="cs--icon"/>
      <label> Combien de carton souhaitez-vous créer ? (Option) </label>
      <span className="cs--text-carton">Pour imprimer les codes barres, aller dans Stock > Carton.</span>
      <TextField name="carton" errorPlacement="rightEnd" className="cs--input-carton" placeholder="10" onChange={handleCartonOutCountChange}/>

     </>
    )}

    </Modal.Body>

    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button onClick={validateModal} appearance="primary" color="blue" disabled={disabled}>
        {primaryButton}
      </Button>
    </Modal.Footer>
    </Form>
    </>
  );

  export default deliveryModal;