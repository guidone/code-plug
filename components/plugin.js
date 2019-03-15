export default class Plugin {

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
    const regions = Array.isArray(region) ? region : [region];
    return regions
      .reduce((acc, region) => this._views[region] != null ? [...acc, ...this._views[region]] : acc, [])
      .filter(Boolean); //compact
  }
}
