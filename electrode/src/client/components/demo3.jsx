import React, { Component } from "react";
import { Nav } from "./nav";
import { connect } from "react-redux";
import counter from "../reducers";
import custom from "../styles/custom.css"; // eslint-disable-line no-unused-vars
import demo3 from "../styles/demo3.css"; // eslint-disable-line no-unused-vars

export default class Demo3 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div styleName={"custom.container"}>
        <Nav {...this.props} />
        <CounterParent />
      </div>
    );
  }
}

class Counter extends React.Component {
  render() {
    return <div styleName={"demo3.text"}>{this.props.display}</div>;
  }
}

class PlusButton extends React.Component {
  render() {
    return (
      <button styleName={"demo3.button"} onClick={this.props.clickHandler}>
        +
      </button>
    );
  }
}

class CounterParent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
    this.increase = this.increase.bind(this);
  }

  increase(e) {
    var currentCount = this.state.count;
    if (e.shiftKey) {
      currentCount += 10;
    } else {
      currentCount += 1;
    }
    this.setState({
      count: currentCount
    });
  }

  render() {
    return (
      <div styleName={"custom.container"}>
        <h1>This is a pure React App</h1>
        <div styleName={"demo3.background"}>
          <Counter display={this.state.count} />
          <PlusButton clickHandler={this.increase} />
        </div>
      </div>
    );
  }
}
