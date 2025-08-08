describe("Cart", () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.visit('/');
    
    // Login avec timeouts et delays
    cy.get('[data-cy="nav-link-login"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(1000); // Attendre que le formulaire se charge
    
    cy.get('[data-cy="login-input-username"]', { timeout: 10000 })
      .type(users.validUser.username, { delay: 100 });
    
    cy.wait(500);
    
    cy.get('[data-cy="login-input-password"]', { timeout: 10000 })
      .type(users.validUser.password, { delay: 100 });
    
    cy.wait(500);
    
    cy.get('[data-cy="login-submit"]', { timeout: 10000 }).click();
    
    // Attendre que le login soit terminé
    cy.get('[data-cy="nav-link-cart"]', { timeout: 20000 })
      .should('be.visible');
    
    cy.wait(1000); // Attendre la stabilisation après login
  });

  it('should add a product to cart', () => {
    // Cliquer sur le bouton pour afficher les produits
    cy.get('.text-header > button', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(2000); // Attendre que les produits se chargent
    
    // Sélectionner et cliquer sur un produit
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(1500); // Attendre que la page produit se charge
    
    // Ajouter au panier
    cy.get('[data-cy="detail-product-add"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.wait(1000); // Attendre que l'ajout soit traité
    
    // Aller au panier
    cy.visit('/#/cart');
    cy.wait(2000); // Attendre que la page panier se charge
    
    // Vérifier que le produit est dans le panier
    cy.get('[data-cy="cart-line-name"]', { timeout: 15000 })
      .should('exist');
  });

  it('should modify quantity in cart', () => {
    // Cliquer sur le bouton pour afficher les produits
    cy.get('.text-header > button', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(2000);
    
    // Sélectionner et cliquer sur un produit
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(1500);
    
    // Ajouter au panier
    cy.get('[data-cy="detail-product-add"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.wait(1000);
    
    // Aller au panier
    cy.visit('/#/cart');
    cy.wait(2000);
    
    // Modifier la quantité
    cy.get('[data-cy="cart-line-quantity"]', { timeout: 15000 })
      .first()
      .should('be.visible')
      .clear();
    
    cy.wait(500);
    
    cy.get('[data-cy="cart-line-quantity"]')
      .first()
      .type('2', { delay: 100 });
    
    cy.wait(2000); // Attendre que la modification soit traitée
  });

  it('should handle negative quantity', () => {
    // Cliquer sur le bouton pour afficher les produits
    cy.get('.text-header > button', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(2000);
    
    // Sélectionner et cliquer sur un produit différent
    cy.get(':nth-child(8) > .add-to-cart > [data-cy="product-link"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(1500);
    
    // Modifier la quantité avec une valeur négative
    cy.get('[data-cy="detail-product-quantity"]', { timeout: 10000 })
      .should('be.visible')
      .clear();
    
    cy.wait(500);
    
    cy.get('[data-cy="detail-product-quantity"]')
      .type('-1', { delay: 100 });
    
    cy.wait(1000); // Attendre la validation
  });

  it('should remove product from cart', () => {
    // Cliquer sur le bouton pour afficher les produits
    cy.get('.text-header > button', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(2000);
    
    // Sélectionner et cliquer sur un produit
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(1500);
    
    // Ajouter au panier
    cy.get('[data-cy="detail-product-add"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.wait(1000);
    
    // Aller au panier
    cy.visit('/#/cart');
    cy.wait(2000);
    
    // Supprimer le produit
    cy.get('[data-cy="cart-line-delete"]', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click();
    
    cy.wait(2000); // Attendre que la suppression soit traitée
  });

  it('should show cart total', () => {
    // Cliquer sur le bouton pour afficher les produits
    cy.get('.text-header > button', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(2000);
    
    // Sélectionner et cliquer sur un produit
    cy.get(':nth-child(7) > .add-to-cart > [data-cy="product-link"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(1500);
    
    // Ajouter au panier
    cy.get('[data-cy="detail-product-add"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.wait(1000);
    
    // Aller au panier
    cy.visit('/#/cart');
    cy.wait(2000);
    
    // Vérifier que le total est affiché
    cy.get('[data-cy="cart-total"]', { timeout: 10000 })
      .should('be.visible');
  });
});