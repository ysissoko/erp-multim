import React from 'react';
import { Modal, Button, Input, Icon, Schema, Form, FormGroup, FormControl } from 'rsuite';
import '../../static/css/modal.less'

const { StringType, NumberType } = Schema.Types;

const model = Schema.Model({
  name: StringType()
    .isRequired('Le champs est vide'),
  label:  StringType().
    isRequired('Le champs est vide'),
  carton: NumberType('Veuillez entrer un chiffre')
    .isRequired('Le champs est obligatoire')
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

const InputModal = ({ title, subtitle, icon, text, placeholder, primaryButton, secondaryButton, closeModal, inputValue, onInputChange, validateModal, modalType, disabled }) => (
    <>
    <Form model={model}>
    <Modal.Header>
      <h3>{title}</h3>
      <h6 className="cs--subtitle">{subtitle}</h6>
    </Modal.Header>

    <Modal.Body>
      <Icon icon={icon} className="cs--icon"/>
      <label className="cs--label">{text}</label>
      {(modalType === 'cartonIN' || modalType === 'cartonOUT') && (      
        <TextField name="carton" errorPlacement="bottomEnd" className="cs--input" placeholder={placeholder} value={inputValue} onChange={onInputChange}/>
      )}
      {(modalType === 'brand' || modalType === 'supplier') && (      
        <TextField name="label" errorPlacement="bottomEnd" className="cs--input" placeholder={placeholder} value={inputValue} onChange={onInputChange}/>
      )}
    </Modal.Body>

    <Modal.Footer>
      <Button onClick={closeModal} appearance="default">
        {secondaryButton}
      </Button>
      <Button disabled={disabled} type="submit" onClick={validateModal} appearance="primary" color="blue">
        {primaryButton}
      </Button>
    </Modal.Footer>
    </Form>
    </>
  );

  export default InputModal;