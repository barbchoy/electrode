import React, { Component } from "react";
import { Nav } from "./nav";
import { connect } from "react-redux";
import custom from "../styles/custom.css"; // eslint-disable-line no-unused-vars
import demoStyle from "../styles/demo2.css"; // eslint-disable-line no-unused-vars

export default class Demo3 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <h1>Hi Electrode!</h1>;
  }
}
