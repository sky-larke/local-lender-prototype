/* globals cy */

describe('Test App', () => {

  it('launches', () => {
    cy.visit('/');
  });

  it('opens with the LocalLender hero message', () => {
    cy.visit('/');
    cy.get('[data-cy=hero]').should('contain', 'Borrow useful things from people nearby.');
  });

  it('shows listing cards on the explore page', () => {
    cy.visit('/');
    cy.get('[data-cy=listing-card]').should('exist');
  });

  it('shows empty state when search returns no results', () => {
    cy.visit('/');
    cy.get('[data-cy=search-input]').type('xyzzy99notreal');
    cy.contains('No listings match your search yet.').should('exist');
  });

});
