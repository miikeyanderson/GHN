describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should show login form', () => {
    cy.get('[data-testid=login-form]').should('exist')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
  })

  it('should validate email format', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('password123')
    cy.get('[data-testid=login-button]').click()
    cy.get('[data-testid=email-error]').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('[data-testid=login-button]').click()
    cy.get('[data-testid=login-error]').should('be.visible')
  })
})
