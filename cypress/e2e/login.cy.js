// FRONT ***************************
describe("Login Tests", () => {
  it('should successfully log in with valid credentials', () => {
    cy.visit('/');

cy.get('[data-cy="nav-link-login"]', { timeout: 10000 }).should('be.visible').click();
    cy.get('[data-cy="login-input-username"]').type('test2@test.fr');
    cy.get('[data-cy="login-input-password"]').type('testest');

    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="nav-link-cart"]').should('be.visible');
  });
});

// API ******************************

describe("API Tests", () => {
  const apiUrl = Cypress.env('apiUrl');

  beforeEach(() => {
    // Vérification que l'API soit dispo avant chaque test
    cy.request(`${apiUrl}/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq("ok");
    });
  });
// LOG IN AVEC IDENTIFIANTS VALIDES***********************
  it('should return 200 and tokens when credentials are valid', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: {
        username: 'test2@test.fr',
        password: 'testtest'
      }
    }).then((response) => {
      // Vérifie que le code HTTP est 200 OK
      expect(response.status).to.eq(200);

      // Vérifie que la réponse contient bien 'token' et 'refresh_token'
      expect(response.body).to.have.all.keys('token', 'refresh_token');

      // Vérifie que ces deux champs sont des chaînes de caractères
      expect(response.body.token).to.be.a('string');
      expect(response.body.refresh_token).to.be.a('string');
    });
  });
  // LOG IN IDENTIFIANTS INVALIDES ************************
  it.only('should return 400 when sending malformed JSON', () => {
  cy.request({
    method: 'POST',
    url: `${apiUrl}/login`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // username mal 
    body: "{ username: 'noQuotes', password: 'test' }", 
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(400);
    // selon la doc, pas de corps précisé pour cette erreur
    // on vérifie donc uniquement le code
  });
});


});  
