describe("Login", () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  it('should successfully log in with valid credentials', () => {
    // 1. Visit the homepage
    cy.visit('/');

    // 2. Wait for the login button to be visible and click it
    cy.get('[data-cy="nav-link-login"]', { timeout: 15000 })
      .should('be.visible')
      .click();

    // 3. Fill the login form with delays
    cy.wait(1000); // Attendre que le formulaire soit chargé
    cy.get('[data-cy="login-input-username"]', { timeout: 10000 })
      .type(users.validUser.username, { delay: 100 });
    
    cy.wait(500);
    cy.get('[data-cy="login-input-password"]', { timeout: 10000 })
      .type(users.validUser.password, { delay: 100 });

    // 4. Submit the form
    cy.wait(500);
    cy.get('[data-cy="login-submit"]', { timeout: 10000 }).click();

    // 5. Verify that login was successful (the cart becomes visible)
    cy.get('[data-cy="nav-link-cart"]', { timeout: 20000 })
      .should('be.visible');
  });

  it('should display an error with invalid credentials', () => {
    // 1. Visit the homepage
    cy.visit('/');

    // 2. Click on the login button
    cy.get('[data-cy="nav-link-login"]', { timeout: 15000 })
      .should('be.visible')
      .click();

    // 3. Fill the form with invalid credentials
    cy.wait(1000);
    cy.get('[data-cy="login-input-username"]', { timeout: 10000 })
      .type(users.invalidUser.username, { delay: 100 });
    
    cy.wait(500);
    cy.get('[data-cy="login-input-password"]', { timeout: 10000 })
      .type(users.invalidUser.password, { delay: 100 });

    // 4. Submit the form
    cy.wait(500);
    cy.get('[data-cy="login-submit"]', { timeout: 10000 }).click();

    // 5. Verify that the error message appears
    cy.get('[data-cy="login-errors"]', { timeout: 15000 })
      .should('be.visible')
      .and('contain', 'Identifiants incorrects');
  });

  it('should prevent submission with empty fields', () => {
    // 1. Visit the homepage
    cy.visit('/');

    // 2. Click on the login button
    cy.get('[data-cy="nav-link-login"]', { timeout: 15000 })
      .should('be.visible')
      .click();

    // 3. Submit the form without filling fields
    cy.wait(1000); // Attendre que le formulaire soit chargé
    cy.get('[data-cy="login-submit"]', { timeout: 10000 }).click();

    // 4. Verify that the error message appears after submit
    cy.get('[data-cy="login-errors"]', { timeout: 15000 })
      .should('be.visible')
      .and('contain', 'Merci de remplir correctement tous les champs');
  });

});