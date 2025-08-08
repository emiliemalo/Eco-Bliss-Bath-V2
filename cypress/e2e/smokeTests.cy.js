describe('Smoke Tests', () => {
  let users;

  before(() => {
    //Récupération du users.json
    cy.fixture('users.json').then((userData) => {
      users = userData;
    });
  });

  beforeEach(() => {
    cy.visit('http://localhost:4200/#');
    cy.wait(2000); // Attendre plus longtemps le chargement initial
    
    // Debug : vérifier que la page est bien chargée
    cy.get('body').should('be.visible');
    cy.url().should('include', 'localhost:4200');
  });

  // Smoke test 1 : Vérification des éléments de connexion
  it('should display login elements', () => {
    // Debug : afficher tous les éléments disponibles
    cy.get('body').then(() => {
      console.log('Page chargée, recherche du bouton login...');
    });

    cy.get('[data-cy="nav-link-login"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .click();
    
    cy.wait(2000); // Attendre plus longtemps que la page de login se charge
    
    // Debug : vérifier l'URL après le clic
    cy.url().then((url) => {
      console.log('URL actuelle :', url);
    });
    
    cy.get('[data-cy="login-input-username"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible');
    
    cy.get('[data-cy="login-input-password"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible');
    
    cy.get('[data-cy="login-submit"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible');
  });

  // Smoke test 2 : Vérification des boutons d'ajout au panier après connexion
  it('should display add to cart buttons when logged in', () => {
    // Se connecter
    cy.get('[data-cy="nav-link-login"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .click();
    
    cy.wait(2000); // Attendre que le formulaire de login se charge
    
    cy.get('[data-cy="login-input-username"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .clear()
      .type(users.validUser.username, { delay: 100 });
    
    cy.wait(500);
    
    cy.get('[data-cy="login-input-password"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .clear()
      .type(users.validUser.password, { delay: 100 });
    
    cy.wait(500);
    
    cy.get('[data-cy="login-submit"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .click();

    cy.wait(3000); // Attendre plus longtemps que la connexion soit traitée

    // Debug : vérifier l'état après login
    cy.url().then((url) => {
      console.log('URL après login :', url);
    });

    // Vérifier le bouton du panier
    cy.get('[data-cy="nav-link-cart"]', { timeout: 20000 })
      .should('exist')
      .should('be.visible');
  });
});