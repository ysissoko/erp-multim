import React, { Component } from 'react';
import { Form, FormGroup, FormControl, ControlLabel, ButtonToolbar, Button, Schema, Alert  } from 'rsuite';
import Router from 'next/router';
import {AuthService} from '../../services/main.bundle';

const { StringType } = Schema.Types;

const model = Schema.Model({
  username: StringType().containsLetterOnly("Entrer un nom d'utilisateur valide").isRequired("Entrer le nom d'utilisateur"),
  password: StringType().isRequired("Entrer le mot de passe")
});

class LoginForm extends Component {

    constructor()
    {
      super();
      this._authService = new AuthService;

      this.state = {
        checkTrigger: 'change',
        formValue: {},
        formError: {}
      };

      this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount()
    {
      // Remove  remaining token in the local storage
      localStorage.removeItem("access_token");
    }

    handleSubmit() {
      const { formValue } = this.state;

      if (!this.form.check()) {
        console.error('Form Error');
        return;
      }

      this._authService.login(formValue.username, formValue.password)
                        .then((result) => {
                          localStorage.setItem("access_token", result.data.access_token);
                          Router.push("/operation");
                        }).catch(e => {
                          if(e.response && e.response.data.statusCode === 401)
                            Alert.error("Identifiants incorrect", 5000);
                          else
                            Alert.error("Erreur de connexion au serveur", 5000);
                        })
    }

    render() {

      const { formError, formValue, checkTrigger } = this.state;

      return (
      <>
        <Form
          ref={ref => (this.form = ref)}
          onChange={formValue => {
            this.setState({ formValue });
          }}
          onCheck={formError => {
            this.setState({ formError });
          }}
          formError={formError}
          formDefaultValue={formValue}
          model={model}
          checkTrigger={checkTrigger}>
            <h3 className="title">Bienvenue, </h3>
            <h6 className="subtitle">Commençons par la connexion</h6>
            <FormGroup>
                <ControlLabel>Identifiant</ControlLabel>
                <FormControl className="cs-button" name="username" type="username" placeholder="Nom d'utilisateur" />
            </FormGroup>
            <FormGroup>
                <ControlLabel>Mot de passe</ControlLabel>
                <FormControl className="cs-button" name="password" type="password" />
            </FormGroup>
            <FormGroup>
            <ButtonToolbar>
                <Button className="start-button" onClick={this.handleSubmit} appearance="primary">C'est parti !</Button>
            </ButtonToolbar>
            </FormGroup>
        </Form>
      </>);
    }
  }

export default LoginForm;