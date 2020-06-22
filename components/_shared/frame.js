import React, { Component } from 'react';
import classNames from "classnames";
import PropTypes from "prop-types";

import '../../static/css/frame.less';

import {
  Container,
  Sidebar,
  Sidenav,
  Icon,
  Content,
  Dropdown,
  Nav,
  DOMHelper
} from "rsuite";

import { Navbar } from 'rsuite';

const { getHeight, on } = DOMHelper;
const navs = [
  {
    key: "1",
    icon: <Icon icon="truck" />,
    text: "Opération",
    link: "/operation"
  },
  {
    key: "2",
    icon: <Icon icon="cube" />,
    text: "Stock",
    link: "/stock"
  },
  {
    key: "3",
    icon: <Icon icon="home" />,
    text: "Entrepôt",
    link: "/entrepot"
  }
];


//for the toggle style
const styles = {
    icon: {
      width: 56,
      height: 56,
      lineHeight: "56px",
      textAlign: "center"
    },
    navItem: {
      width: 56,
      textAlign: "center"
    }
  };
// toggle component
const NavToggle = ({ expand, onChange }) => {
    return (
      <Navbar appearance="subtle" className="nav-toggle">
        <Navbar.Body>
          <Nav>
            <Dropdown
              placement={expand ? "topStart" : "rightEnd"}
              trigger="click"
              renderTitle={children => {
                return <Icon style={styles.icon} icon="cog" />;
              }}
            >
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item>Sign out</Dropdown.Item>
            </Dropdown>
          </Nav>
  
          <Nav pullRight>
            <Nav.Item onClick={onChange} style={styles.navItem}>
              <Icon icon={expand ? "angle-left" : "angle-right"} />
            </Nav.Item>
          </Nav>
        </Navbar.Body>
      </Navbar>
    );
  };

class Frame extends Component {
  resizeListenner = null;
  static contextTypes = {
    router: PropTypes.object
  };

//   expand false by default closed
  constructor(props) {
    super(props);
    this.state = {
      windowHeight: 0,
      expand: false
    };
  }
  componentDidMount() {
    this.resizeListenner = on(window, "resize", this.updateHeight);
    this.setState({
      windowHeight: getHeight(window)
    });
  }

  updateHeight = () => {
    this.setState({
      windowHeight: getHeight(window)
    });
  };
  handleToggle = () => {
    this.setState({
      expand: !this.state.expand
    });
  };

  componentWillUnmount() {
    if (this.resizeListenner) {
      this.resizeListenner.off();
    }
  }

  renderNavs() {
    return navs.map((item, i) => {
      return (
        <Nav.Item
          href={item.link}
          key={item.key}
          eventKey={item.key}
          icon={item.icon}
        >
          {item.text}
        </Nav.Item>
      );
    });
  }

  render() {
    const { children, activeKey } = this.props;
    const { expand, windowHeight } = this.state;

    const containerClasses = classNames("page-container", {
      "container-full": !expand
    });

    let navBodyStyle = null;
    if (expand) {
      navBodyStyle = {
        height: windowHeight - 112,
        overflow: "auto"
      };
    }

    return (
      <Container className="frame">
        <Sidebar
          style={{ display: "flex", flexDirection: "column" }}
          width={expand ? 200 : 56}
          collapsible
        >
          <Sidenav.Header>
            <div className="header-hrand">
              <a href="/">
                <Icon
                  icon="logo-analytics"
                  size="lg"
                  style={{ verticalAlign: 0 }}
                />
                <span style={{ marginLeft: 12 }}> MULTI-M </span>
              </a>
            </div>
          </Sidenav.Header>
          <Sidenav
            expanded={expand}
            //defaultOpenKeys={["1", "2", "3"]}
            activeKey={activeKey}
            appearance="subtle"
          >
            <Sidenav.Body style={navBodyStyle}>
              <Nav>
                {this.renderNavs()}
              </Nav>
            </Sidenav.Body>
          </Sidenav>
          <NavToggle expand={expand} onChange={this.handleToggle} />
        </Sidebar>

        <Container className={containerClasses}>
          <Content>{children}</Content>
        </Container>
      </Container>
    );
  }
}

export default Frame;
