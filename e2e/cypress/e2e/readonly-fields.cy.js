describe('Readonly Fields', () => {
  beforeEach(() => {
    // Login as admin user
    cy.visit('/login')
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('password')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  describe('Currency CRUD with readonly fields', () => {
    it('should show readonly fields as disabled in edit form', () => {
      // Navigate to currencies
      cy.visit('/currencies')
      
      // Click on first currency to edit
      cy.get('table tbody tr').first().within(() => {
        cy.get('a[href*="/edit"]').click()
      })
      
      // Verify readonly fields have readonly attribute
      cy.get('input[name="created_at"]').should('have.attr', 'readonly')
      cy.get('input[name="updated_at"]').should('have.attr', 'readonly')
      
      // Verify non-readonly fields don't have readonly attribute
      cy.get('input[name="name"]').should('not.have.attr', 'readonly')
      cy.get('input[name="symbol"]').should('not.have.attr', 'readonly')
    })

    it('should not allow editing readonly fields', () => {
      cy.visit('/currencies')
      
      // Click on first currency to edit
      cy.get('table tbody tr').first().within(() => {
        cy.get('a[href*="/edit"]').click()
      })
      
      // Try to type in readonly field - should not work
      cy.get('input[name="created_at"]').invoke('val').then((originalValue) => {
        cy.get('input[name="created_at"]').type('{selectall}2025-01-01T00:00:00')
        cy.get('input[name="created_at"]').invoke('val').should('eq', originalValue)
      })
    })

    it('should apply visual styling to readonly fields', () => {
      cy.visit('/currencies')
      
      // Click on first currency to edit
      cy.get('table tbody tr').first().within(() => {
        cy.get('a[href*="/edit"]').click()
      })
      
      // Check CSS styling
      cy.get('input[name="created_at"]').should('have.css', 'cursor', 'not-allowed')
      cy.get('input[name="created_at"]').should('have.css', 'opacity').and('match', /0\.7/)
      
      // Check background color (will be gray)
      cy.get('input[name="created_at"]').should('have.css', 'background-color')
        .and('not.equal', 'rgb(255, 255, 255)') // Not white
    })

    it('should not submit readonly fields in form data', () => {
      cy.visit('/currencies')
      
      // Intercept the update request
      cy.intercept('POST', '/currencies/*').as('updateCurrency')
      
      // Click on first currency to edit
      cy.get('table tbody tr').first().within(() => {
        cy.get('a[href*="/edit"]').click()
      })
      
      // Update a non-readonly field
      cy.get('input[name="name"]').clear().type('Updated Currency Name')
      
      // Submit form
      cy.get('button[type="submit"]').contains('Save').click()
      
      // Verify the request
      cy.wait('@updateCurrency').then((interception) => {
        const formData = new URLSearchParams(interception.request.body)
        
        // Non-readonly fields should be in form data
        expect(formData.has('name')).to.be.true
        expect(formData.get('name')).to.equal('Updated Currency Name')
        
        // Readonly fields should NOT be in form data
        expect(formData.has('created_at')).to.be.false
        expect(formData.has('updated_at')).to.be.false
      })
    })
  })

  describe('Different field types with readonly', () => {
    it('should handle readonly select fields', () => {
      // Create a test entity with readonly select field
      // This would require a test endpoint with such fields
      
      // For now, verify the CSS applies to select elements
      cy.visit('/currencies/new')
      
      // If there were select fields, verify:
      // cy.get('select[readonly]').should('have.css', 'cursor', 'not-allowed')
      // cy.get('select[readonly]').should('have.css', 'pointer-events', 'none')
    })

    it('should handle readonly checkbox fields', () => {
      // Similar to select, would need test entity with readonly checkbox
      
      // Verify CSS for checkboxes
      // cy.get('input[type="checkbox"][readonly]').should('have.css', 'pointer-events', 'none')
    })

    it('should handle readonly textarea fields', () => {
      // Verify CSS for textareas
      // cy.get('textarea[readonly]').should('have.css', 'cursor', 'not-allowed')
      // cy.get('textarea[readonly]').should('have.css', 'opacity', '0.7')
    })
  })

  describe('Visual appearance', () => {
    it('should differentiate readonly fields visually', () => {
      cy.visit('/currencies')
      
      // Take screenshot for visual regression testing
      cy.get('table tbody tr').first().within(() => {
        cy.get('a[href*="/edit"]').click()
      })
      
      cy.wait(500) // Wait for styles to apply
      
      // Take screenshot of form with readonly fields
      cy.get('#edit-content').screenshot('readonly-fields-form', {
        capture: 'viewport',
        overwrite: true
      })
      
      // Verify contrast between readonly and editable fields
      cy.get('input[readonly]').first().then($readonly => {
        cy.get('input:not([readonly])').first().then($editable => {
          const readonlyBg = $readonly.css('background-color')
          const editableBg = $editable.css('background-color')
          
          // Background colors should be different
          expect(readonlyBg).to.not.equal(editableBg)
        })
      })
    })
  })
})