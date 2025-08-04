// FRONT ***************************
describe("Login Tests", () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  it.only('should successfully log in with valid credentials', () => {
    cy.visit('/');
    cy.get('[data-cy="nav-link-login"]', { timeout: 10000 }).should('be.visible').click();
    cy.get('[data-cy="login-input-username"]').type(users.validUser.username);
    cy.get('[data-cy="login-input-password"]').type(users.validUser.password);
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="nav-link-cart"]').should('be.visible');
  });
});

// API ******************************
describe("API Login Endpoint Tests", () => {
  const apiUrl = Cypress.env('apiUrl');

  beforeEach(() => {
    // Vérification que l'API soit dispo avant chaque test
    cy.request(`${apiUrl}/api/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq("ok");
    });
  });

  it('should return 200 and tokens when credentials are valid', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: users.validUser
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.key('token');
      expect(response.body.token).to.be.a('string');
    });
  });

  it('should return 400 when sending malformed JSON', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: "{ username: 'noQuotes', password: 'test' }",
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should return 401 when credentials are invalid', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: users.invalidUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});  
