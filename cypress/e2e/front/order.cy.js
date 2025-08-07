describe("Panier", () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    // Connexion utilisateur avant chaque test
    cy.visit('/');
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type(users.validUser.username);
    cy.get('[data-cy="login-input-password"]').type(users.validUser.password);
    cy.get('[data-cy="login-submit"]').click();
  });

  it('devrait ajouter un produit au panier', () => {
    // Navigation vers un produit
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();

    // Récupération du nom du produit et ajout au panier
    cy.get('[data-cy="detail-product-skin"]').invoke('text').then((productName) => {
      cy.get('[data-cy="detail-product-add"]').click();

      // Vérification dans le panier
      cy.visit('/#/cart');
      cy.get('[data-cy="cart-line-name"]').should('contain', productName);
      cy.get('[data-cy="cart-line-quantity"]').first().should('have.value', '1');
    });
  });

  it('devrait permettre de modifier la quantité dans le panier', () => {
    // Ajout d'un produit au panier
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();

    // Navigation vers le panier et modification de la quantité
    cy.visit('/#/cart');
    cy.get('[data-cy="cart-line-quantity"]').first().clear().type('2');
    
    // Vérification de la mise à jour
    cy.get('[data-cy="cart-line-quantity"]').first().should('have.value', '2');
  });

  it('ne devrait pas permettre d\'ajouter une quantité négative', () => {
    // Navigation vers un produit
    cy.get('.text-header > button').click();
    cy.get(':nth-child(8) > .add-to-cart > [data-cy="product-link"]').click();

    // Tentative d'ajout d'une quantité négative
    cy.get('[data-cy="detail-product-quantity"]').clear().type('-1');
    
    // Vérification que l'action est bloquée
    cy.get('[data-cy="quantity-error"]').should('be.visible');
    cy.get('[data-cy="detail-product-add"]').should('have.attr', 'disabled');
  });

  it('devrait permettre de supprimer un produit du panier', () => {
    // Ajout d'un produit au panier
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();

    // Suppression du produit depuis le panier
    cy.visit('/#/cart');
    cy.get('[data-cy="cart-line-name"]').invoke('text').then((productName) => {
      cy.get('[data-cy="cart-line-delete"]').first().click();

      // Vérification que le produit n'est plus présent
      cy.get('[data-cy="cart-line-name"]').should('not.exist');
    });
  });

  it('devrait mettre à jour le total du panier correctement', () => {
    // Navigation vers un produit et récupération du prix
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    
    cy.get('[data-cy="detail-product-price"]').invoke('text').then((priceText) => {
      const productPrice = parseFloat(priceText.replace('€', '').replace(',', '.').trim());

      // Ajout au panier et vérification du total
      cy.get('[data-cy="detail-product-add"]').click();
      cy.visit('/#/cart');

      cy.get('[data-cy="cart-total"]').invoke('text').then((total) => {
        const cartTotal = parseFloat(total.replace('€', '').replace(',', '.').trim());
        expect(cartTotal).to.equal(productPrice);
      });
    });
  });
});
