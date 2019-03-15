import React from 'react';
import isPlugin from '../helpers/is-plugin';
import isFunction from '../helpers/is-function';
import maybe from '../helpers/maybe';

import PlugItContext from '../context';

class CodePlug extends React.Component {

  // todo proptypes

  static defaultProps = {
    debug: false,
    plugins: []
  };

  constructor(props) {
    super(props);

    this.getItems = this.getItems.bind(this);

    const hooks = this.getHooks();
    const { plugins, ...newProps } = this.props;

    const filteredPlugins = (plugins || [])
      .filter(plugin => isPlugin(plugin))
      .filter(plugin => this.filterWith(hooks, plugin))
      .map(plugin => new plugin(newProps));

    this.state = {
      plugins: filteredPlugins,
      allPlugins: plugins
    };
  }

  filterWith(hooks, plugin) {
    let result = true;
    hooks.forEach(hook => {
      if (result) {
        result = !!hook.call(this, plugin);
      }

    });
    return result;
  }

  getHooks() {
    const { plugins } = this.props;
    return plugins
      .filter(plugin => isFunction(plugin) && !isPlugin(plugin));
  }

  getPlugins() {
    return this.state.plugins;
  }

  getAllPlugins() {
    return this.state.allPlugins;
  }

  getItems(region, props = null) {
    const { plugins } = this.state;

    return plugins
      .map(plugin => (
        maybe(plugin.getViews(region))
          .map(item => ({
            view: item.view,
            props: isFunction(item.props) ? item.props(props) : item.props,
            plugin
          })))
      ) // enrich with plugin
      .reduce((a, v) => a.concat(v), []) //flatten
      .filter(Boolean); //compact
  }


  render() {

    const { plugins } = this.state;

    return (
      <PlugItContext.Provider value={{ plugins, codePlug: this }}>
        {this.props.children}
      </PlugItContext.Provider>
    );
  }
}

export default CodePlug;
