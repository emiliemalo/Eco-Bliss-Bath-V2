
// VERIFICATION DE LA PRESENCE DES CHAMPS ET BOUTON DE CONNEXION 
describe('Smoke Test - Connexion', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/#');
  });

  it('Display connexion button on homepage', () => {
    cy.get('[data-cy="nav-link-login"]').should('be.visible');
  });

  it('Display login form after clicking on connexion', () => {
    cy.get('[data-cy=""]').click();

    cy.get('[data-cy="login-input-username"]').should('be.visible');
    cy.get('[data-cy="login-input-password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });
});

// VERIFICATION DE LA PRESENCE DES BOUTONS D AJOUT AU PANIER QUAND LE USER EST CONNECTE
describe('Smoke Test - Acces panier', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/#');
  });

  it('Display add to cart button when user is logged in', () => {
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type('user@example.com');
    cy.get('[data-cy="login-input-password"]').type('password');
    cy.get('[data-cy="login-submit"]').click();

    cy.get('[data-cy="product-1-add-to-cart"]').should('be.visible');
  });
});