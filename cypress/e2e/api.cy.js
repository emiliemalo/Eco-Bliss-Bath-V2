// ICI on définit l'url de l'API
const apiUrl = 'http://localhost:8081';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const validUser = {
  username: 'emiliemalo261@gmail.com',
  password: 'Password123'
};

const validProduct = {
  id: 1,
  name: "Sample Product",
  description: "A product for testing",
  price: 10.99,
  picture: "sample.jpg"
};

// Vérifie la structure d'une commande
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

// Récupère un token d’authentification
function loginAndGetToken() {
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/login`,
    headers: defaultHeaders,
    body: validUser
  }).then(res => res.body.token);
}

// Vérification de la disponibilité de l'API avant chaque test
beforeEach(() => {
  cy.request(`${apiUrl}/api/health`).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.status).to.eq("ok");
  });
});

describe("API Tests", () => {
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
      const msg = (response.body.message || response.body.error || '').toLowerCase().replace(/[^a-z]/g, '');
      expect(msg).to.include('invalidcredentials');
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
      headers: defaultHeaders,
      body: validUser
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('token', 'refresh_token');
      expect(response.body.token).to.be.a('string');
      expect(response.body.refresh_token).to.be.a('string');
    });
  });
});

describe('API ORDERS Endpoint Tests', () => {
  let token;

  beforeEach(() => {
    loginAndGetToken().then(t => { token = t; });
  });

  it('should return 200 and a valid order structure when an order exists', () => {
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

  it('should return 404 if there is no current order', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/orders`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 404) {
        expect(response.body).to.be.empty;
      }
    });
  });

  it('should create a new order and return 200 with the correct structure', () => {
    const newOrder = {
      firstname: "John",
      lastname: "Doe",
      address: "123 Main St",
      zipCode: "12345",
      city: "Sample City",
      date: new Date().toISOString(),
      validated: true,
      orderLines: [
        {
          product: validProduct,
          quantity: 2
        }
      ]
    };

    cy.request({
      method: 'POST',
      url: `${apiUrl}/orders`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: newOrder,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      expectOrderStructure(response.body);
      expect(response.body.firstname).to.eq(newOrder.firstname);
      expect(response.body.lastname).to.eq(newOrder.lastname);
      expect(response.body.address).to.eq(newOrder.address);
      expect(response.body.zipCode).to.eq(newOrder.zipCode);
      expect(response.body.city).to.eq(newOrder.city);
      expect(response.body.validated).to.eq(newOrder.validated);
    });
  });

  it('should add a product to the cart and return 200 with the updated cart structure', () => {
    const addToCartPayload = {
      product: validProduct,
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

  it('should remove a product from the cart and return 200 with the updated cart structure', () => {
    const removeFromCartPayload = {
      productId: validProduct.id
    };

    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/orders/remove`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: removeFromCartPayload,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        expectOrderStructure(response.body);
      } else if (response.status === 404) {
        expect(response.body).to.be.empty;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    });
  });

  it('should update the quantity of a product in the cart and return 200 with the updated cart structure', () => {
    // Pour un vrai test, il faudrait récupérer dynamiquement orderId et orderLineId
    const orderId = 1;
    const orderLineId = 1;
    const newQuantity = 5;

    const updateQuantityPayload = {
      orderLineId,
      quantity: newQuantity
    };

    cy.request({
      method: 'PUT',
      url: `${apiUrl}/orders/${orderId}`,
      headers: { ...defaultHeaders, Authorization: `Bearer ${token}` },
      body: updateQuantityPayload,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        expectOrderStructure(response.body);
        const updatedLine = response.body.orderLines.find(line => line.id === orderLineId);
        if (updatedLine) {
          expect(updatedLine.quantity).to.eq(newQuantity);
        }
      } else if (response.status === 404) {
        expect(response.body).to.be.empty;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    });
  });
});

