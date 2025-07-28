// Configuration de base
const apiUrl = Cypress.env('apiUrl');

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Utilisateur valide pour les tests
const validUser = {
  username: 'test2@test.fr',
  password: 'testtest'
};

// ====================================
// Fonctions utilitaires de vérification
// ====================================
function expectOrderStructure(order) {
  expect(order).to.have.all.keys(
    'id', 'firstname', 'lastname', 'address', 'zipCode', 'city', 'date', 'validated', 'orderLines'
  );
  expect(order.orderLines).to.be.an('array');
  if (order.orderLines.length > 0) {
    const line = order.orderLines[0];
    expect(line).to.have.all.keys('id', 'product', 'quantity');
    expect(line.product).to.have.all.keys('id', 'name', 'description', 'price', 'picture');
  }
}

function expectProductStructure(product) {
  expect(product).to.have.all.keys(
    'id', 'name', 'availableStock', 'skin', 'aromas', 'ingredients', 'description', 'price', 'picture', 'varieties'
  );
}

function expectReviewStructure(review) {
  expect(review).to.have.all.keys('id', 'date', 'title', 'comment', 'rating', 'author');
  expect(review.author).to.have.all.keys('id', 'email', 'roles', 'password', 'firstname', 'lastname', 'plainPassword', 'userIdentifier', 'username', 'salt');
  expect(review.rating).to.be.a('number').and.be.within(1, 5);
}

function loginAndGetToken() {
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/login`,
    headers: defaultHeaders,
    body: validUser,
    failOnStatusCode: false
  }).then(res => {
    if (res.status === 200) {
      return res.body.token;
    }
    throw new Error(`Login failed: ${res.status}`);
  });
}

// ====================================
// 1. HEALTH CHECK - Vérification API
// ====================================
describe("1. API Health Check", () => {
  it('should confirm API is available', () => {
    cy.request(`${apiUrl}/api/health`).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

// ====================================
// 2. AUTHENTICATION - Tests de connexion
// ====================================
describe("2. API Authentication Tests", () => {
  it('should return a 401 error when trying to login with invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: defaultHeaders,
      body: {
        username: 'wrongtest@test.fr',
        password: 'wrongPassword'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });

  it('should return a 400 error when trying to login with invalid JSON', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
    });
  });

  it('should login successfully with valid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: defaultHeaders,
      body: validUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('refresh_token');
    });
  });

  it('should return a 403 error when trying to access protected resource without token', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/orders`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(403);
    });
  });
});

// ====================================
// 3. ORDERS - Tests des commandes
// ====================================
describe("3. API Orders Tests", () => {
  let token;
  let productId;

  beforeEach(() => {
    // Récupération du token
    loginAndGetToken().then(t => { 
      token = t; 
    });
    
    // Récupération d'un produit disponible
    cy.request({
      method: 'GET',
      url: `${apiUrl}/products`,
      headers: defaultHeaders
    }).then((response) => {
      if (response.body.length > 0) {
        productId = response.body[0].id;
      }
    });
  });

  it('should return current order or 404 if no order exists', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/orders`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        expectOrderStructure(response.body);
      } else {
        expect(response.status).to.eq(404);
      }
    });
  });

  it('should add a product to the cart', () => {
    const addToCartPayload = {
      product: productId,
      quantity: 2
    };

    cy.request({
      method: 'PUT',
      url: `${apiUrl}/orders/add`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: addToCartPayload,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      expectOrderStructure(response.body);
    });
  });

  it('should not add a product with excessive quantity to the cart', () => {
    // Récupération du stock disponible d'abord
    cy.request({
      method: 'GET',
      url: `${apiUrl}/products/${productId}`,
      headers: defaultHeaders
    }).then((productResponse) => {
      const availableStock = productResponse.body.availableStock;
      
      // Tentative d'ajout d'une quantité supérieure au stock
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/orders/add`,
        headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
        body: {
          product: productId,
          quantity: availableStock + 10
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409]);
      });
    });
  });

  it('should validate/create an order', () => {
    // D'abord ajouter un produit au panier
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/orders/add`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: {
        product: productId,
        quantity: 1
      }
    }).then(() => {
      // Puis valider la commande
      const orderData = {
        firstname: "John",
        lastname: "Doe",
        address: "123 Main St",
        zipCode: "12345",
        city: "Sample City"
      };

      cy.request({
        method: 'POST',
        url: `${apiUrl}/orders`,
        headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
        body: orderData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expectOrderStructure(response.body);
        expect(response.body.firstname).to.eq(orderData.firstname);
        expect(response.body.lastname).to.eq(orderData.lastname);
        expect(response.body.validated).to.eq(true);
      });
    });
  });

  it('should return 404 when trying to validate order without current cart', () => {
    const orderData = {
      firstname: "John",
      lastname: "Doe",
      address: "123 Main St",
      zipCode: "12345",
      city: "Sample City"
    };

    cy.request({
      method: 'POST',
      url: `${apiUrl}/orders`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: orderData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should remove a product from the cart', () => {
    // D'abord ajouter un produit
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/orders/add`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: {
        product: productId,
        quantity: 1
      }
    }).then(() => {
      // Récupérer la commande pour avoir l'orderLineId
      cy.request({
        method: 'GET',
        url: `${apiUrl}/orders`,
        headers: { ...defaultHeaders, Authorization: `Bearer ${token}` }
      }).then((orderResponse) => {
        const orderLineId = orderResponse.body.orderLines[0].id;
        
        // Supprimer le produit
        cy.request({
          method: 'DELETE',
          url: `${apiUrl}/orders/${orderLineId}/delete`,
          headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200);
          expectOrderStructure(response.body);
        });
      });
    });
  });

  it('should return 404 when trying to remove non-existent product from cart', () => {
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/orders/99999/delete`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should change quantity of a product in the cart', () => {
    // D'abord ajouter un produit au panier
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/orders/add`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: {
        product: productId,
        quantity: 1
      }
    }).then(() => {
      // Récupérer la commande actuelle pour avoir l'orderLineId
      cy.request({
        method: 'GET',
        url: `${apiUrl}/orders`,
        headers: { ...defaultHeaders, Authorization: `Bearer ${token}` }
      }).then((orderResponse) => {
        const orderLineId = orderResponse.body.orderLines[0].id;
        
        // Changer la quantité
        cy.request({
          method: 'PUT',
          url: `${apiUrl}/orders/${orderLineId}/change-quantity`,
          headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
          body: {
            quantity: 3
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.all.keys('id', 'product', 'quantity');
          expect(response.body.quantity).to.eq(3);
        });
      });
    });
  });

  it('should return 404 when trying to change quantity of non-existent product', () => {
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/orders/99999/change-quantity`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: {
        quantity: 5
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});

// ====================================
// 4. PRODUCTS - Tests des produits
// ====================================
describe("4. API Products Tests", () => {
  it('should return all available products', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/products`,
      headers: defaultHeaders,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      
      if (response.body.length > 0) {
        response.body.forEach(product => {
          expectProductStructure(product);
        });
      }
    });
  });

  it('should return 3 random products', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/products/random`,
      headers: defaultHeaders,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array').and.have.length(3);
      
      response.body.forEach(product => {
        expectProductStructure(product);
      });
    });
  });

  it('should return the details of a specific product', () => {
    // Récupération d'un produit d'abord
    cy.request({
      method: 'GET',
      url: `${apiUrl}/products`,
      headers: defaultHeaders
    }).then((response) => {
      const firstProductId = response.body[0].id;
      
      // Test de récupération du détail
      cy.request({
        method: 'GET',
        url: `${apiUrl}/products/${firstProductId}`,
        headers: defaultHeaders,
        failOnStatusCode: false
      }).then((detailResponse) => {
        expect(detailResponse.status).to.equal(200);
        expect(detailResponse.body).to.have.property('id', firstProductId);
        expectProductStructure(detailResponse.body);
      });
    });
  });

  it('should return 404 for non-existent product', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/products/99999`,
      headers: defaultHeaders,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(404);
    });
  });
});

// ====================================
// 5. REVIEWS - Tests des avis
// ====================================
describe("5. API Reviews Tests", () => {
  let token;

  beforeEach(() => {
    loginAndGetToken().then(t => { 
      token = t; 
    });
  });

  it('should return all reviews', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/reviews`,
      headers: defaultHeaders,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      
      if (response.body.length > 0) {
        response.body.forEach(review => {
          expectReviewStructure(review);
        });
      }
    });
  });

  it('should create a new review', () => {
    const reviewData = {
      title: 'Test review',
      comment: 'This is a test comment',
      rating: 5
    };

    cy.request({
      method: 'POST',
      url: `${apiUrl}/reviews`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: reviewData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expectReviewStructure(response.body);
      expect(response.body.title).to.eq(reviewData.title);
      expect(response.body.comment).to.eq(reviewData.comment);
      expect(response.body.rating).to.eq(reviewData.rating);
    });
  });

  it('should return 400 when creating review with invalid data', () => {
    const invalidReviewData = {
      title: 'Test review',
      comment: 'This is a test comment',
      rating: 10 // Invalid rating (should be 1-5)
    };

    cy.request({
      method: 'POST',
      url: `${apiUrl}/reviews`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: invalidReviewData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
    });
  });

  it('should return 403 when creating review without authentication', () => {
    const reviewData = {
      title: 'Test review',
      comment: 'This is a test comment',
      rating: 5
    };

    cy.request({
      method: 'POST',
      url: `${apiUrl}/reviews`,
      headers: defaultHeaders,
      body: reviewData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(403);
    });
  });
});

// ====================================
// 6. USERS - Tests des utilisateurs
// ====================================
describe("6. API Users Tests", () => {
  let token;

  beforeEach(() => {
    loginAndGetToken().then(t => { 
      token = t; 
    });
  });

  it('should register a new user', () => {
    const newUser = {
      email: `test${Date.now()}@example.com`,
      firstname: 'Test',
      lastname: 'User',
      plainPassword: 'TestPassword123'
    };

    cy.request({
      method: 'POST',
      url: `${apiUrl}/register`,
      headers: defaultHeaders,
      body: newUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id');
      expect(response.body.email).to.eq(newUser.email);
      expect(response.body.firstname).to.eq(newUser.firstname);
      expect(response.body.lastname).to.eq(newUser.lastname);
    });
  });

  it('should return 400 when registering with invalid data', () => {
    const invalidUser = {
      email: 'invalid-email',
      firstname: 'Test',
      lastname: 'User'
      // plainPassword missing
    };

    cy.request({
      method: 'POST',
      url: `${apiUrl}/register`,
      headers: defaultHeaders,
      body: invalidUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
    });
  });

  it('should return current user info', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/me`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('email');
      expect(response.body).to.have.property('firstname');
      expect(response.body).to.have.property('lastname');
    });
  });

  it('should return 403 when accessing user info without authentication', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/me`,
      headers: defaultHeaders,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(403);
    });
  });
});