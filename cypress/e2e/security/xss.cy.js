describe('XSS Security Test', () => {
  const testScripts = [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(\'xss\')">',
    '<a href="javascript:alert(\'xss\')">click-me</a>'
  ];

  beforeEach(() => {
    cy.visit('http://localhost:4200');
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[data-cy="login-input-username"]').type('test2@test.fr');
    cy.get('[data-cy="login-input-password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();
    cy.wait(1000);
    cy.get('[data-cy="nav-link-logout"]').should('exist');
  });

  testScripts.forEach((script, index) => {
    it(`XSS Test #${index + 1} - Security verification`, () => {
      // Intercepter les alertes AVANT la navigation
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      cy.visit('http://localhost:4200/#/reviews');

      cy.get('[data-cy="review-form"]').within(() => {
        cy.get('[data-cy="review-input-comment"]').type(script);
        cy.get('[data-cy="review-input-title"]').type('XSS Test');
        cy.get('[data-cy="review-submit"]').click();
      });

      // Attendre que la soumission soit traitée
      cy.wait(2000);

      // Vérifier qu'aucune alerte n'a été déclenchée
      cy.get('@windowAlert').should('not.have.been.called');

      // Vérifier le contenu du dernier commentaire ajouté
      cy.get('[data-cy="review-detail"]').first().within(() => {
        cy.get('[data-cy="review-comment"]').then(($comment) => {
          const commentText = $comment.text();
          const commentHtml = $comment.html();
          
          // Le script ne doit pas être exécuté (présence d'entités échappées)
          switch(index) {
            case 0: // <script> test
              expect(commentHtml).to.satisfy((html) => 
                html.includes('&lt;script&gt;') || 
                html.includes('&amp;lt;script&amp;gt;') ||
                !html.includes('<script>')
              );
              break;
            case 1: // <img onerror> test
              expect(commentHtml).to.satisfy((html) => 
                html.includes('&lt;img') || 
                html.includes('&amp;lt;img') ||
                (!html.includes('<img') || !html.includes('onerror='))
              );
              break;
            case 2: // javascript: test
              expect(commentHtml).to.not.include('href="javascript:');
              break;
          }
        });
      });

      // Vérifier globalement qu'aucun script malveillant n'est présent dans le DOM
      cy.get('body').then(($body) => {
        const bodyHtml = $body.html();
        // Pas de script non-échappé
        expect(bodyHtml).to.not.match(/<script[^>]*>.*alert.*<\/script>/);
        // Pas d'attribut onerror avec alert
        expect(bodyHtml).to.not.match(/onerror\s*=\s*["'].*alert.*["']/);
        // Pas de javascript: href non-échappé
        expect(bodyHtml).to.not.match(/href\s*=\s*["']javascript:.*alert.*["']/);
      });
    });
  });

  it('Test with special characters - HTML entities verification', () => {
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.visit('http://localhost:4200/#/reviews');

    cy.get('[data-cy="review-form"]').within(() => {
      const specialChars = '<>"\'&';
      cy.get('[data-cy="review-input-comment"]').type(specialChars);
      cy.get('[data-cy="review-input-title"]').type('Special Characters');
      cy.get('[data-cy="review-submit"]').click();
    });

    cy.wait(2000);

    // Vérifier le dernier commentaire ajouté
    cy.get('[data-cy="review-detail"]').first().within(() => {
      cy.get('[data-cy="review-comment"]').then(($comment) => {
        const commentHtml = $comment.html();
        
        // Vérifier l'échappement des caractères spéciaux
        const hasProperEscaping = 
          commentHtml.includes('&lt;') ||     // < échappé
          commentHtml.includes('&gt;') ||     // > échappé
          commentHtml.includes('&quot;') ||   // " échappé
          commentHtml.includes('&#39;') ||    // ' échappé (forme numérique)
          commentHtml.includes('&apos;') ||   // ' échappé (forme nommée)
          commentHtml.includes('&amp;');      // & échappé

        expect(hasProperEscaping).to.be.true;
        
        // Les caractères ne doivent pas être présents sous forme brute si échappés
        if (commentHtml.includes('&lt;')) {
          // Si < est échappé, alors les caractères bruts ne devraient pas créer de vulnérabilité
          expect(commentHtml).to.not.match(/<[^\/!][^>]*>/); // Pas de tags HTML malveillants
        }
      });
    });

    // Aucune alerte ne doit avoir été déclenchée
    cy.get('@windowAlert').should('not.have.been.called');
  });

  // Test supplémentaire pour vérifier la protection contre l'injection de contenu
  it('Verify no HTML injection in displayed content', () => {
    const maliciousContent = '<div onclick="alert(\'injected\')">Click me</div>';
    
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.visit('http://localhost:4200/#/reviews');

    cy.get('[data-cy="review-form"]').within(() => {
      cy.get('[data-cy="review-input-comment"]').type(maliciousContent);
      cy.get('[data-cy="review-input-title"]').type('HTML Injection Test');
      cy.get('[data-cy="review-submit"]').click();
    });

    cy.wait(2000);

    // Le contenu injecté ne doit pas être rendu comme HTML
    cy.get('[data-cy="review-detail"]').first().within(() => {
      cy.get('[data-cy="review-comment"]').then(($comment) => {
        // Le texte doit être affiché mais pas interprété comme HTML
        expect($comment.text()).to.include('Click me');
        // Mais il ne doit pas y avoir d'élément div cliquable
        cy.get('div[onclick]').should('not.exist');
      });
    });

    cy.get('@windowAlert').should('not.have.been.called');
  });
});
