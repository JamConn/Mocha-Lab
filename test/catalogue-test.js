const chai = require("chai");
const Catalogue = require("../src/productCatalogue");
const Product = require("../src/product");

const expect = chai.expect;
let cat = null;
let batch = null;

describe("Catalogue", () => {
  beforeEach( () => {
    cat = new Catalogue("Test Catalogue");
    cat.addProduct(new Product("A123", "Product 1", 100, 10, 10.0));
    cat.addProduct(new Product("A124", "Product 2", 100, 10.0));
    cat.addProduct(new Product("A125", "Product 3", 100, 10, 10.0));
    console.log('before block')
  });
  describe("findProductById", function () {
    it("should find a valid product id", function () {
      const result = cat.findProductById("A123");
      expect(result.name).to.equal("Product 1");
    });
    it("should return undefined for invalid product id", function () {
      const result = cat.findProductById("A321");
      expect(result).to.be.undefined;
    });
  });
  describe("removeProductById", () => {
    it("should remove product with a valid id", () => {
      let result = cat.removeProductById("A123");
      expect(result.id).to.equal("A123");
      // Check target state
      result = cat.findProductById("A123");
      expect(result).to.be.undefined;
    });
    it("should return undefined when product id is invalid.", () => {
      const result = cat.removeProductById("A321");
      expect(result).to.be.undefined;
    });
    describe("checkReorder", () => {
        it("should return an empty array when no products need reordering", function () {
          const result = cat.checkReorders();
          expect(result.productIds).to.be.empty;
        });
        it("should report products that satisfy the reorder criteria", function () {
          cat.addProduct(new Product("B123", "Product 4", 10, 20, 10.0));
          cat.addProduct(new Product("B124", "Product 5", 10, 30, 10.0));
          const result = cat.checkReorders();
          expect(result.productIds).to.have.lengthOf(2);
          expect(result.productIds).to.have.members(["B123", "B124"]);
        });
        it("should include products just on their reorder level", function () {
          cat.addProduct(new Product("B125", "Product 6", 10, 10, 10.0));
          const result = cat.checkReorders();
          expect(result.productIds).to.have.members(["B125"]);
        });
        it("should handle an the empty catalogue case", function () {
          cat = new Catalogue("Test catalogue");
          const result = cat.checkReorders();
          expect(result.productIds).to.be.empty;
        });
      });
    describe("batchAddProducts", () => {
        beforeEach(function () {
          batch = {
            type: 'Batch',
            products: [
              new Product("A126", "Product 6", 100, 10, 10.0),
              new Product("A127", "Product 7", 100, 10, 10.0),
            ],
          };
        });
        it("should update the catalogue for a normal request and return the number added", () => {
          const result = cat.batchAddProducts(batch);
          expect(result).to.equal(2);
          let addedProduct = cat.findProductById("A126");
          expect(addedProduct).to.not.be.undefined;
          addedProduct = cat.findProductById("A127");
          expect(addedProduct).to.not.be.undefined;
        });
        it("should only add products with a non-zero quantity in stock", () => {
            batch.products.push(new Product("A128", "Product 8", 0, 10, 10.0));
            const result = cat.batchAddProducts(batch);
            expect(result).to.equal(2);
            const rejectedProduct = cat.findProductById("A128");
            expect(rejectedProduct).to.be.undefined;
        });
        it("should throw an exception when batch includes an existing product id", () => {
          batch.products.push(new Product("A123", "Product 9", 0, 10, 10.0));
          expect(() => cat.batchAddProducts(batch)).to.throw("Bad Batch");
          // Target state
          let rejectedProduct = cat.findProductById("A126");
          expect(rejectedProduct).to.be.undefined; 
        });
      });
      describe("search", function () {
        beforeEach(function () {
          cat.addProduct(new Product("W123", "Widget 1", 100, 10, 12.0));
          cat.addProduct(new Product("W124", "Widget 2", 100, 10, 14.0));
        });
    
        it("should return products whose name contains the substring", function () {
          const result = cat.search({ keyword: "Product" });
          expect(result.length).to.equal(3);
          const productNames = result.map((p) => p.name);
          expect(productNames).to.have.members([
            "Product 1",
            "Product 2",
            "Product 3",
          ]);
        });
        it("should return products whose price is below the limit", function () {
          const result = cat.search({ price: 11.0 });
          expect(result.length).to.equal(3);
          const productNames = result.map((p) => p.name);
          expect(productNames).to.have.members([
            "Product 1",
            "Product 2",
            "Product 3",
          ]);
        });
        it("should throw an error when criteria is not valid option", function () {
          expect(() => cat.search({ badCriteria: "" })).to.throw("Bad search");
        });
    
        describe("boundry cases", function () {
          it("should return an empty array for when no name matches", function () {
            const result = cat.search({ keyword: "XXX" });
            expect(result.length).to.equal(0);
          });
          it("should return empty array when no price matches found", function () {
            const result = cat.search({ price: 5.0 });
            expect(result.length).to.equal(0);
          });
          it("should include products whose price is equal to the limit given", function () {
            const result = cat.search({ price: 10.0 });
            expect(result.length).to.equal(3);
            const productNames = result.map( p => p.name);
            expect(productNames).to.have.members([
              "Product 1",
              "Product 2",
              "Product 3",
            ]);
          });
        });
      });
    });
  });