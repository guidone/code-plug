import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';

const PlugItContext = React.createContext({
  plugins: []
});
const isFunction = func => typeof func === 'function';

// better check
const isPlugin = obj => {
  return obj != null && obj.prototype != null && obj.prototype.constructor != null
    && obj.prototype.constructor.__proto__ != null && obj.prototype.constructor.__proto__.name === 'Plugin';
};

// todo generate id aut
// todo add prop-types libyarn d

const maybe = obj => obj != null ? obj : [];

class CodePlug extends React.Component {

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

  getItems(region) {
    const { plugins } = this.state;

    return plugins
      .map(plugin => maybe(plugin.getViews(region)).map(item => ({ ...item, plugin }))) // enrich with plugin
      .reduce((a, v) => a.concat(v), []) //flatten
      .filter(Boolean); //compact
  }


  render() {

    const { plugins } = this.state;

    return (
      <PlugItContext.Provider value={{ plugins, getItems: this.getItems, codePlug: this }}>
        {this.props.children}
      </PlugItContext.Provider>
    );
  }
}

class Consumer extends React.Component {

  static contextType = PlugItContext;

  render() {

    const { codePlug } = this.context;

    return (
      <Fragment>
        {isFunction(this.props.children) ? this.props.children(codePlug) : this.props.children}
      </Fragment>
    );
  }
}

const generateKey = (view, options) => {
  const id = options != null && options.id != null ? `-${options.id}` : '';
  if (
    view != null &&
    view.prototype != null &&
    view.prototype.constructor != null &&
    view.prototype.constructor.displayName != null
  ) {
    return `${view.prototype.constructor.displayName}${id}`;
  } else if (view != null && view.prototype != null && view.prototype.namespace != null) {
    return `${view.prototype.namespace}${id}`;
  } else if (view != null && view.name != null) {
    return `${view.name}${id}`;
  } else if (id !== '') {
    return id;
  } else {
    console.log(
      `Both the "namespace" and "displayName" properties were missing from a registered view,
      it's needed to generate the correct key reference for child components in React`
    );
  }
};

class Views extends React.Component {
  static contextType = PlugItContext;

  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    region: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ]).isRequired
  };

  getPlugins() {
    return [
      { label:'aa '},
      { label:'bb '}

    ];

  }

  render() {
    const { region, className, style, children: renderProp } = this.props;
    // eslint-disable-next-line no-unused-vars
    const { region: _region, ...rest } = this.props;
    const { plugins } = this.context;
    const dom = plugins
      .map(plugin => {
        return (plugin.getViews(region) || []).map(item => {
          const props = { ...item.props };
          const View = item.view;
          if (typeof renderProp === 'function') {
            return renderProp(View, { key: generateKey(View, item.props), ...rest, ...props }, plugin);
          } else {
            return <View key={generateKey(View, item.props)} {...rest} {...props} />;
          }
        });
      })
      .reduce((a, v) => a.concat(v), []) //flatten
      .filter(Boolean); //compact

    return <Fragment>{dom}</Fragment>;
  }
}

class Items extends React.Component {
  static contextType = PlugItContext;

  render() {

    const { region, className, style, children: renderProp } = this.props;
    // eslint-disable-next-line no-unused-vars
    const { region: _region, ...rest } = this.props;
    const { plugins } = this.context;

    const collection = plugins
      .map(plugin => {
        return (plugin.getViews(region) || []).map(item => {
          return {
            ...item,
            plugin
          };
        });

      })
      .reduce((a, v) => a.concat(v), []) //flatten
      .filter(Boolean); //compact

    return <Fragment>{renderProp(collection)}</Fragment>;
  }
}

class Plugin {

  className = 'plugin';

  constructor(props) {
    this._views = {};
  }

  registerView(region, view, props) {
    if (this._views[region] == null) {
      this._views[region] = [];
    }
    // todo do some checks
    this._views[region].push({ view, props });
    return this;
  }

  register(region, props) {
    this.registerView(region, null, props);
    return this;
  }

  getViews(region) {
    const regions = _.isArray(region) ? region : [region];
    return regions
      .reduce((acc, region) => this._views[region] != null ? [...acc, ...this._views[region]] : acc, [])
      .filter(Boolean); //compact
  }
}

const PlugItUserPermissions = function(plugin) {
  const { user } = this.props || {};
  const permission = plugin != null && plugin.prototype != null && plugin.prototype.constructor != null ?
    plugin.prototype.constructor.permission : null;
  if (user != null && user.permissions != null && user.permissions.includes(permission)) {
    return true;
  }
  console.log(`Plugin ${plugin != null ? plugin.name : 'unnamed'} not loaded, missing ${permission}!`);
};





export { PlugItContext as context, CodePlug, Consumer, Views, Items, Plugin, PlugItUserPermissions };
