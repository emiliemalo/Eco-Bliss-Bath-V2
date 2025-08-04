describe("Tests du Panier", () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    // Se connecter avant chaque test
    cy.visit('/');
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type(users.validUser.username);
    cy.get('[data-cy="login-input-password"]').type(users.validUser.password);
    cy.get('[data-cy="login-submit"]').click();

  });

  // Test 1: Ajout d'un produit au panier
  it('devrait ajouter un produit au panier', () => {
    // Navigation vers la page produit
    cy.get('.text-header > button').click(); // Ouvrir la section "Nos Produits"
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click(); // Cliquer sur "Consulter"

    // Récupérer le nom du produit pour la vérification
    cy.get('[data-cy="product-name"]').invoke('text').then((productName) => {
      // Ajouter au panier
      cy.get('[data-cy="detail-product-add"]').click();

      // Vérifier que le produit apparaît dans le panier
      cy.get('#cart-content').should('contain', productName);
      cy.get('.quantity').should('have.value', '1');
    });

  });

  // Test 2: Modification de la quantité dans le panier
  it('devrait permettre de modifier la quantité dans le panier', () => {
    // Ajouter d'abord un produit au panier
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();

    // Modifier la quantité
    cy.get('[data-cy="cart-item-quantity"]').clear().type('2');
    
    // Vérifier que la quantité est mise à jour
    cy.get('[data-cy="cart-item-quantity"]').should('have.value', '2');
  });

  // Test 3: Validation des quantités négatives
  it('ne devrait pas permettre d\'ajouter une quantité négative', () => {
    // Navigation vers la page produit
    cy.get('.text-header > button').click();
    cy.get(':nth-child(8) > .add-to-cart > [data-cy="product-link"]').click();

    // Tentative d'ajout d'une quantité négative
    cy.get('[data-cy="detail-product-quantity"]').clear().type('-1');
    
    // Le bouton devrait être désactivé
    cy.get('[data-cy="detail-product-add"]').should('be.disabled');
    // ou vérifier le message d'erreur si c'est le comportement attendu
    cy.get('[data-cy="quantity-error"]').should('be.visible');
  });

  // Test 4: Suppression d'un produit du panier
  it('devrait permettre de supprimer un produit du panier', () => {
    // Ajouter d'abord un produit au panier
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    cy.get('[data-cy="detail-product-add"]').click();

    // Supprimer le produit du panier
    cy.get('[data-cy="remove-from-cart"]').click();

    // Vérifier que le panier est vide
    cy.get('#cart-content').should('not.contain', 'Mousse de rêve');
    // ou vérifier le message de panier vide
    cy.get('[data-cy="empty-cart-message"]').should('be.visible');
  });

  // Test 5: Vérification du total du panier
  it('devrait mettre à jour le total du panier correctement', () => {
    // Ajouter un produit au panier
    cy.get('.text-header > button').click();
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]').click();
    
    // Récupérer le prix du produit
    cy.get('[data-cy="product-price"]').invoke('text').then((price) => {
      const productPrice = parseFloat(price.replace('€', '').trim());
      
      // Ajouter au panier
      cy.get('[data-cy="detail-product-add"]').click();
      
      // Vérifier que le total correspond au prix
      cy.get('[data-cy="cart-total"]').invoke('text').then((total) => {
        const cartTotal = parseFloat(total.replace('€', '').trim());
        expect(cartTotal).to.equal(productPrice);
      });
    });
  });
});
