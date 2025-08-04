describe('Test Simple de Faille XSS', () => {
  // Données de test basiques
  const testScripts = [
    // Script simple avec alert
    '<script>alert("xss")</script>',
    // Injection dans une balise img
    '<img src="x" onerror="alert(\'xss\')">',
    // Script dans un lien
    '<a href="javascript:alert(\'xss\')">cliquez-moi</a>'
  ];

  // Test simple pour chaque script
  testScripts.forEach((script, index) => {
    it(`Test XSS #${index + 1} - Vérification de la sécurité`, () => {
      // 1. Aller sur la page d'accueil
      cy.visit('http://localhost:4200');
      
      // 2. Se connecter
      cy.get('[data-cy="nav-link-login"]').click();
      cy.get('[data-cy="login-input-username"]').type('test2@test.fr');
      cy.get('[data-cy="login-input-password"]').type('testtest');
      cy.get('[data-cy="login-submit"]').click();

      // 3. Aller sur la page des reviews
      cy.visit('http://localhost:4200/#/reviews');

      // 4. Essayer d'injecter le script dans le commentaire
      cy.get('[data-cy="review-input-comment"]').type(script);

      // 3. Envoyer le commentaire
      cy.get('[data-cy="review-submit"]').click();

      // 4. Vérifier que le script n'est pas exécuté
      cy.get('[data-cy="review-content"]').last().then((comment) => {
        // Le HTML ne devrait pas contenir de balises non échappées
        const contenu = comment.html();
        
        // Vérifier que les caractères < et > sont échappés
        expect(contenu).not.to.include('<script>');
        expect(contenu).not.to.include('<img');
        expect(contenu).not.to.include('javascript:');
      });

      // 5. Vérifier qu'aucune alerte n'apparaît
      cy.on('window:alert', (message) => {
        // Le test échoue si une alerte apparaît
        throw new Error('Une alerte a été déclenchée - Faille XSS détectée!');
      });
    });
  });

  // Test simple avec des caractères spéciaux
  it('Test avec caractères spéciaux', () => {
    // 1. Aller sur la page d'accueil
    cy.visit('http://localhost:4200');
    
    // 2. Se connecter
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type('test2@test.fr');
    cy.get('[data-cy="login-input-password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();

    // 3. Aller sur la page des reviews
    cy.visit('http://localhost:4200/#/reviews');

    // 4. Essayer d'injecter des caractères spéciaux
    const caracteresSpeciaux = '<>"\'&';
    cy.get('[data-cy="review-input-comment"]').type(caracteresSpeciaux);

    // 3. Envoyer le commentaire
    cy.get('[data-cy="review-submit"]').click();

    // 4. Vérifier que les caractères spéciaux sont bien échappés
    cy.get('[data-cy="review-content"]').last().then((comment) => {
      const contenu = comment.html();
      expect(contenu).to.include('&lt;'); // < est échappé
      expect(contenu).to.include('&gt;'); // > est échappé
      expect(contenu).to.include('&quot;'); // " est échappé
      expect(contenu).to.include('&#39;'); // ' est échappé
      expect(contenu).to.include('&amp;'); // & est échappé
    });
  });
});
