import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      register(user: any): Chainable<void>;
      createCar(car: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/items');
  });
});

Cypress.Commands.add('register', (user) => {
  cy.visit('/register');
  cy.get('#firstName').type(user.firstName);
  cy.get('#lastName').type(user.lastName);
  cy.get('#email').type(user.email);
  cy.get('#password').type(user.password);
  cy.get('#confirmPassword').type(user.confirmPassword);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/items');
});

Cypress.Commands.add('createCar', (car) => {
  cy.visit('/items/new');
  cy.get('#brand').select(car.brand);
  cy.get('#model').type(car.model);
  cy.get('#year').clear().type(car.year);
  cy.get('#color').select(car.color);
  cy.get('#price').clear().type(car.price);

  if (car.mileage) cy.get('#mileage').type(car.mileage);
  if (car.fuelType) cy.get('#fuelType').select(car.fuelType);
  if (car.transmission) cy.get('#transmission').select(car.transmission);
  if (car.description) cy.get('#description').type(car.description);

  cy.contains('button[type="submit"]', 'Add Car').click();
  cy.url().should('include', '/items');
});

export {};
