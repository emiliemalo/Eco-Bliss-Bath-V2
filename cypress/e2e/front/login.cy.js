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
    cy.get('[data-cy="nav-link-login"]', { timeout: 10000 })
      .should('be.visible')
      .click();

    // 3. Fill the login form
    cy.get('[data-cy="login-input-username"]')
      .type(users.validUser.username);
    cy.get('[data-cy="login-input-password"]')
      .type(users.validUser.password);

    // 4. Submit the form
    cy.get('[data-cy="login-submit"]').click();

    // 5. Verify that login was successful (the cart becomes visible)
    cy.get('[data-cy="nav-link-cart"]')
      .should('be.visible');
  });

  it('should display an error with invalid credentials', () => {
    // 1. Visit the homepage
    cy.visit('/');

    // 2. Click on the login button
    cy.get('[data-cy="nav-link-login"]')
      .should('be.visible')
      .click();

    // 3. Fill the form with invalid credentials
    cy.get('[data-cy="login-input-username"]')
      .type(users.invalidUser.username);
    cy.get('[data-cy="login-input-password"]')
      .type(users.invalidUser.password);

    // 4. Submit the form
    cy.get('[data-cy="login-submit"]').click();

    // 5. Verify that the error message appears
    cy.get('[data-cy="login-errors"]')
      .should('be.visible')
      .and('contain', 'Incorrect credentials');
  });

  it('should prevent submission with empty fields', () => {
    // 1. Visit the homepage
    cy.visit('/');

    // 2. Click on the login button
    cy.get('[data-cy="nav-link-login"]')
      .should('be.visible')
      .click();

    // 3. Submit the form without filling fields
    cy.get('[data-cy="login-submit"]').click();

    // 4. Verify that the error message appears after submit
    cy.get('[data-cy="login-errors"]')
      .should('be.visible')
      .and('contain', 'Please fill out all fields correctly');
  });

});
