describe('Test de Sécurité XSS', () => {
  const testScripts = [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(\'xss\')">',
    '<a href="javascript:alert(\'xss\')">cliquez-moi</a>'
  ];

  beforeEach(() => {
    cy.visit('http://localhost:4200');
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type('test2@test.fr');
    cy.get('[data-cy="login-input-password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();
    // Attendre que la connexion soit effectuée
    cy.wait(1000);
    // Vérifier que l'utilisateur est connecté
    cy.get('[data-cy="nav-link-logout"]').should('exist');
  });

  testScripts.forEach((script, index) => {
    it(`Test XSS #${index + 1} - Vérification de la sécurité`, () => {
      cy.visit('http://localhost:4200/#/reviews');

      cy.get('[data-cy="review-form"]').within(() => {
        cy.get('[data-cy="review-input-comment"]').type(script);
        cy.get('[data-cy="review-input-title"]').type('Test XSS');
        cy.get('[data-cy="review-submit"]').click();
      });

      cy.get('[data-cy="review-content"]').last().then((comment) => {
        const contenu = comment.html();
        expect(contenu).not.to.include('<script>');
        expect(contenu).not.to.include('<img');
        expect(contenu).not.to.include('javascript:');
      });

      cy.on('window:alert', () => {
        throw new Error('Une alerte a été déclenchée - Faille XSS détectée!');
      });
    });
  });

  it('Test avec caractères spéciaux', () => {
    cy.visit('http://localhost:4200/#/reviews');

    cy.get('[data-cy="review-form"]').within(() => {
      const caracteresSpeciaux = '<>"\'&';
      cy.get('[data-cy="review-input-comment"]').type(caracteresSpeciaux);
      cy.get('[data-cy="review-input-title"]').type('Caractères spéciaux');
      cy.get('[data-cy="review-submit"]').click();
    });

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
