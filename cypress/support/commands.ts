declare global {
  namespace Cypress {
    interface Chainable {
      registerUser(user: any): Chainable<void>;
      createCar(car: any): Chainable<void>;
      loginUser(email: string, password: string): Chainable<void>;
      mockAuthState(user: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mockAuthState', (user) => {
  cy.window().then((win) => {
    win.localStorage.setItem('auth_token', 'mock-jwt-token');
    win.localStorage.setItem('user_data', JSON.stringify(user));
  });
  cy.reload();
});

Cypress.Commands.add('registerUser', (user) => {
  cy.visit('/register');

  // Mock successful registration
  cy.intercept('POST', '/auth/register', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        accessToken: 'mock-jwt-token',
        user: {
          id: 1,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
    },
  }).as('registerRequest');

  // Fill registration form
  cy.get('#firstName').clear().type(user.firstName);
  cy.get('#lastName').clear().type(user.lastName);
  cy.get('#email').clear().type(user.email);
  cy.get('#password').clear().type(user.password);
  cy.get('#confirmPassword').clear().type(user.confirmPassword);

  // Wait for form validation
  cy.wait(1000);

  // Submit the form
  cy.get('button[type="submit"]').click();

  // Wait for registration to complete
  cy.wait('@registerRequest');

  // Wait for navigation to items page
  cy.url().should('include', '/items', { timeout: 10000 });
});

Cypress.Commands.add('createCar', (car) => {
  cy.visit('/items/new');

  // Mock successful car creation
  cy.intercept('POST', '/cars', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id: 1,
        ...car,
      },
    },
  }).as('createCarRequest');

  // Fill car form
  cy.get('#brand').select(car.brand);
  cy.get('#model').type(car.model);
  cy.get('#year').clear().type(car.year);
  cy.get('#color').select(car.color);
  cy.get('#price').clear().type(car.price);

  // Fill optional fields if provided
  if (car.mileage) cy.get('#mileage').type(car.mileage);
  if (car.fuelType) cy.get('#fuelType').select(car.fuelType);
  if (car.transmission) cy.get('#transmission').select(car.transmission);
  if (car.description) cy.get('#description').type(car.description);

  // Submit the form
  cy.contains('button', 'Add Car').click();

  // Wait for car creation to complete
  cy.wait('@createCarRequest');

  // Wait for navigation back to items
  cy.url().should('include', '/items', { timeout: 10000 });
});

Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/login');

  // Mock successful login
  cy.intercept('POST', '/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        accessToken: 'mock-jwt-token',
        user: {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: email,
        },
      },
    },
  }).as('loginRequest');

  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();

  cy.wait('@loginRequest');
  cy.url().should('include', '/items', { timeout: 10000 });
});

export {};
