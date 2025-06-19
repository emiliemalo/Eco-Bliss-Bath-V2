describe("API Tests", () => {
  const apiUrl = 'http://localhost:8081';

   beforeEach(() => {// Verification que l'API soit dispo avant chaque test
    cy.request(`${apiUrl}/api/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq("ok");
    });
  });

  // TEST API LOGIN *********************************************
    it('should return a 401 error when invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: {
        username: 'wrongtest@test.fr',
        password: 'wrongpassword'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message || response.body.error || '').to.include('invalid credentials');
    });
  });

  
  it('should return a 403 error when trying to access the cart before login', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/orders`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(403);
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
    body: {
      username: 'emiliemalo261@gmail.com',
      password: 'Password123'
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.all.keys('token', 'refresh_token');
    expect(response.body.token).to.be.a('string');
    expect(response.body.refresh_token).to.be.a('string');
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
    // username mal 
    body: "{ username: 'noQuotes', password: 'test' }", 
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(400);
    // selon la doc, pas de corps précisé pour cette erreur
    // on vérifie donc uniquement le code
  });
});

// TEST API COMMANDES *********************************************
  // Ajoute tes autres 5 requêtes ici en utilisant la même variable apiUrl
});
