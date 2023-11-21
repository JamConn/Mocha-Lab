class Catalogue {
  constructor(title) {
    this.title = title;
    this.products = [];
  }

  findProductById(id) {
    const match = this.products.find((product) => id === product.id);
    return match;
  }

  addProduct(product) {
    if (!this.findProductById(product.id)) {
      this.products.push(product);
      return true;
    }
    return false;
  }

  removeProductById(id) {
    const removedProduct = this.findProductById(id);
    if (removedProduct) {
      this.products = this.products.filter(
        (product) => product.id !== id 
      );
    }
    return removedProduct;
  }

  checkReorders() {
    const result = { type: "Reorder", productIds: [] };
    result.productIds = this.products
      .filter((p) => p.quantityInStock <= p.reorderLevel)
      .map((p) => p.id);
    return result;
  }

  batchAddProducts(batch) {
    const invalidAdditions = batch.products.filter(
      (product) => this.findProductById(product.id) !== undefined
    );
    if (invalidAdditions.length > 0 ) {
      throw new Error('Bad Batch')
    }
    const validAdditions = batch.products.filter(
      (product) => product.quantityInStock > 0
    );
    validAdditions.forEach( (p) => this.addProduct(p) );
    return validAdditions.length;
  }


}
module.exports = Catalogue;
