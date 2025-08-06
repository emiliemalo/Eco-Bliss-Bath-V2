describe('Test de Sécurité XSS', () => {
  let users;

  before(() => {
    cy.fixture('users.json').then((data) => {
      users = data;
    });
  });

  // Scripts pour tester différentes méthodes d'injection XSS
  const testScripts = [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(\'xss\')">',
    '<a href="javascript:alert(\'xss\')">cliquez-moi</a>'
  ];

  testScripts.forEach((script, index) => {
    it(`Test XSS #${index + 1} - Vérification de la sécurité`, () => {
      cy.visit('http://localhost:4200');
      cy.get('[data-cy="nav-link-login"]').click();
      cy.get('[data-cy="login-input-username"]').type('test2@test.fr');
      cy.get('[data-cy="login-input-password"]').type('testtest');
      cy.get('[data-cy="login-submit"]').click();

      cy.visit('http://localhost:4200/#/reviews');
      cy.get('[data-cy="review-input-comment"]').type(script);
      cy.get('[data-cy="review-submit"]').click();

      cy.get('[data-cy="review-content"]').last().then((comment) => {
        const contenu = comment.html();
        expect(contenu).not.to.include('<script>');
        expect(contenu).not.to.include('<img');
        expect(contenu).not.to.include('javascript:');
      });

      cy.on('window:alert', (message) => {
        throw new Error('Une alerte a été déclenchée - Faille XSS détectée!');
      });
    });
  });

  // Test de validation de l'échappement des caractères spéciaux
  it('Test avec caractères spéciaux', () => {
    cy.visit('http://localhost:4200');
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type('test2@test.fr');
    cy.get('[data-cy="login-input-password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();

    cy.visit('http://localhost:4200/#/reviews');
    const caracteresSpeciaux = '<>"\'&';
    cy.get('[data-cy="review-input-comment"]').type(caracteresSpeciaux);
    cy.get('[data-cy="review-submit"]').click();

    cy.get('[data-cy="review-content"]').last().then((comment) => {
      const contenu = comment.html();
      expect(contenu).to.include('&lt;');
      expect(contenu).to.include('&gt;');
      expect(contenu).to.include('&quot;');
      expect(contenu).to.include('&#39;');
      expect(contenu).to.include('&amp;');
    });
  });
});
