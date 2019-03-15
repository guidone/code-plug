export default obj => {
  return obj != null && obj.prototype != null && obj.prototype.constructor != null
    && obj.prototype.constructor.__proto__ != null && obj.prototype.constructor.__proto__.name === 'Plugin';
};
