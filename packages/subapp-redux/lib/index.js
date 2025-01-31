"use strict";

const { createStore } = require("redux");

const { registerSubApp } = require("subapp-util");

module.exports = {
  reduxLoadSubApp: subapp => {
    const extras = {
      __redux: true
    };

    if (!subapp.reduxCreateStore && !subapp.reduxReducers) {
      extras.reduxCreateStore = initialState => createStore(x => x, initialState || {});
    }

    return registerSubApp(Object.assign(extras, subapp));
  }
};
