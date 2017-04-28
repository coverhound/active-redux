class Query {
  static findOne(type = this.type, id) {
    return this.store[type].filter((entity) => id === entity.id)[0];
  }

  static findAll(type = this.type, ids) {
    return this.store[type].filter((entity) => ids.includes(entity.id));
  }

  static where() {}
}

export default Query;
