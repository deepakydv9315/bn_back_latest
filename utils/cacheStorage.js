class CacheStorage {
  static #pool = new Map();

  static get = () => this.#pool;
  static set = (key, value) => this.#pool.set(key, value);
  static has = (key) => this.#pool.has(key);
  static delete = (key) => this.#pool.delete(key);
}

module.exports = CacheStorage;
