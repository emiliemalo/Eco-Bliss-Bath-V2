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
    // Wait for login to complete
    cy.wait(1000);
    // Verify the user is logged in
    cy.get('[data-cy="nav-link-logout"]').should('exist');
  });

  testScripts.forEach((script, index) => {
    it(`XSS Test #${index + 1} - Security verification`, () => {
      cy.visit('http://localhost:4200/#/reviews');

      cy.get('[data-cy="review-form"]').within(() => {
        cy.get('[data-cy="review-input-comment"]').type(script);
        cy.get('[data-cy="review-input-title"]').type('XSS Test');
        cy.get('[data-cy="review-submit"]').click();
      });

      cy.get('[data-cy="review-content"]').last().then((comment) => {
        const content = comment.html();
        expect(content).not.to.include('<script>');
        expect(content).not.to.include('<img');
        expect(content).not.to.include('javascript:');
      });

      cy.on('window:alert', () => {
        throw new Error('An alert was triggered - XSS vulnerability detected!');
      });
    });
  });

  it('Test with special characters', () => {
    cy.visit('http://localhost:4200/#/reviews');

    cy.get('[data-cy="review-form"]').within(() => {
      const specialChars = '<>"\'&';
      cy.get('[data-cy="review-input-comment"]').type(specialChars);
      cy.get('[data-cy="review-input-title"]').type('Special Characters');
      cy.get('[data-cy="review-submit"]').click();
    });

    cy.get('[data-cy="review-content"]').last().then((comment) => {
      const content = comment.html();
      expect(content).to.include('&lt;');
      expect(content).to.include('&gt;');
      expect(content).to.include('&quot;');
      expect(content).to.include('&#39;');
      expect(content).to.include('&amp;');
    });
  });
});
