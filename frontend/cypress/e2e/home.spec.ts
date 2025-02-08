describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the welcome message', () => {
    cy.get('h1').should('contain', 'Global HealthOps Nexus')
  })

  it('should have navigation links', () => {
    cy.get('nav')
      .should('exist')
      .within(() => {
        cy.get('a').should('have.length.at.least', 1)
      })
  })

  it('should load without errors', () => {
    cy.window().should('have.property', 'Sentry')
    cy.get('[data-testid=error-boundary]').should('not.exist')
  })

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.get('nav').should('be.visible')
    
    // Test desktop viewport
    cy.viewport('macbook-15')
    cy.get('nav').should('be.visible')
  })
})
