describe("Smoke test de Connexion", () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  it('devrait se connecter avec succès avec des identifiants valides', () => {
    // 1. Visiter la page d'accueil
    cy.visit('/');

    // 2. Attendre que le bouton de connexion soit visible et cliquer dessus
    cy.get('[data-cy="nav-link-login"]', { timeout: 10000 })
      .should('be.visible')
      .click();

    // 3. Remplir le formulaire de connexion
    cy.get('[data-cy="login-input-username"]')
      .type(users.validUser.username);
    cy.get('[data-cy="login-input-password"]')
      .type(users.validUser.password);

    // 4. Soumettre le formulaire
    cy.get('[data-cy="login-submit"]').click();

    // 5. Vérifier que la connexion a réussi (le panier devient visible)
    cy.get('[data-cy="nav-link-cart"]')
      .should('be.visible');
  });

  it('devrait afficher une erreur avec des identifiants invalides', () => {
    // 1. Visiter la page d'accueil
    cy.visit('/');

    // 2. Cliquer sur le bouton de connexion
    cy.get('[data-cy="nav-link-login"]')
      .should('be.visible')
      .click();

    // 3. Remplir le formulaire avec des identifiants invalides
    cy.get('[data-cy="login-input-username"]')
      .type(users.invalidUser.username);
    cy.get('[data-cy="login-input-password"]')
      .type(users.invalidUser.password);

    // 4. Soumettre le formulaire
    cy.get('[data-cy="login-submit"]').click();

    // 5. Vérifier que le message d'erreur apparaît
    cy.get('[data-cy="login-error"]')
      .should('be.visible')
      .and('contain', 'Identifiants invalides');
  });

  it('devrait empêcher la soumission avec des champs vides', () => {
    // 1. Visiter la page d'accueil
    cy.visit('/');

    // 2. Cliquer sur le bouton de connexion
    cy.get('[data-cy="nav-link-login"]')
      .should('be.visible')
      .click();

    // 3. Soumettre le formulaire sans remplir les champs
    cy.get('[data-cy="login-submit"]').click();

    // 4. Vérifier que les messages de validation apparaissent
    cy.get('[data-cy="login-input-username"]:invalid')
      .should('exist');
    cy.get('[data-cy="login-input-password"]:invalid')
      .should('exist');
  });
});
