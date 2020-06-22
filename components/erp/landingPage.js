import React, { Component } from 'react';
import LoginForm from '../erp/loginForm';
import '../../static/css/LandingPage.less';

class LandingPage extends Component {

  render() {
    return (
        <div className="background-img">
          <div className="form">
            <LoginForm/>
          </div>
        </div>
    );
  }
}

export default LandingPage;
