import React, { Component } from "react";
import PropTypes from "prop-types";
import { createStore } from "redux";
import { connect, Provider } from "react-redux";
import { Nav } from "./nav";
import counter from "../reducers/reducer";
import App from "../actions/App";
import custom from "../styles/custom.css"; // eslint-disable-line no-unused-vars
import demo4 from "../styles/demo4.css"; // eslint-disable-line no-unused-vars

var store = createStore(counter);

export default class Demo4 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div styleName={"custom.container"}>
        <Nav {...this.props} />
        <h1>This is a React / Redux Sample</h1>
        <Provider store={store}>
          <App />
        </Provider>
      </div>
    );
  }
}
