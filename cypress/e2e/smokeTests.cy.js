
describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/#');
  });

  // Smoke test 1 : Vérification des éléments de connexion
  it('should display login elements', () => {

    cy.get('[data-cy="nav-link-login"]').should('be.visible');
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').should('be.visible');
    cy.get('[data-cy="login-input-password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });

  // Smoke test 2 : Vérification des boutons d'ajout au panier après connexion
    let users;

  before(() => {
    //Récupération du users.json
    cy.fixture('users.json').then((userData) => {
      users = userData;
    });
  });

  beforeEach(() => {
    cy.visit('http://localhost:4200/#');
  });
  it('should display add to cart buttons when logged in', () => {
    // Se connecter
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type(users.validUser.username);
    cy.get('[data-cy="login-input-password"]').type(users.validUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // Vérifier le bouton du panier
    cy.get('[data-cy="nav-link-cart"]').should('be.visible');
  });
});