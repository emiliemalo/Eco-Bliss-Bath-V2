describe("Cart", () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type(users.validUser.username);
    cy.get('[data-cy="login-input-password"]').type(users.validUser.password);
    cy.get('[data-cy="login-submit"]').click();
  });

  it('should add a product to cart', () => {
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();
    cy.visit('/#/cart');
    cy.get('[data-cy="cart-line-name"]').should('exist');
  });

  it('should modify quantity in cart', () => {
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();
    cy.visit('/#/cart');
    cy.get('[data-cy="cart-line-quantity"]').first().clear().type('2');
    cy.wait(1000);
  });

  it('should handle negative quantity', () => {
    cy.get('.text-header > button').click();
    cy.get(':nth-child(8) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-quantity"]').clear().type('-1');
  });

  it('should remove product from cart', () => {
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();
    cy.visit('/#/cart');
    cy.get('[data-cy="cart-line-delete"]').first().click();
    cy.wait(1000);
  });

  it('should show cart total', () => {
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();
    cy.visit('/#/cart');
  });
});