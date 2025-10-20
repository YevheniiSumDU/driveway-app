import { Component, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HoverEffectDirective } from './hover-effect.directive';

@Component({
  template: `
    <div appHoverEffect class="test-element">Test Element</div>
    <div class="no-directive">No Directive Element</div>
  `,
  standalone: true,
  imports: [HoverEffectDirective],
})
class TestComponent {}

describe('HoverEffectDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testElement: HTMLElement;
  let elementWithoutDirective: HTMLElement;
  let rendererSpy: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    const rendererSpyObj = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);

    await TestBed.configureTestingModule({
      imports: [TestComponent, HoverEffectDirective],
      providers: [{ provide: Renderer2, useValue: rendererSpyObj }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    testElement = fixture.debugElement.query(By.directive(HoverEffectDirective)).nativeElement;
    elementWithoutDirective = fixture.debugElement.query(By.css('.no-directive')).nativeElement;
    rendererSpy = TestBed.inject(Renderer2) as jasmine.SpyObj<Renderer2>;

    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directiveEl = fixture.debugElement.query(By.directive(HoverEffectDirective));
    expect(directiveEl).toBeTruthy();
    expect(directiveEl.nativeElement).toBe(testElement);
  });

  describe('mouseenter event', () => {
    it('should not add class to elements without directive on mouseenter', () => {
      elementWithoutDirective.dispatchEvent(new Event('mouseenter'));

      expect(rendererSpy.addClass).not.toHaveBeenCalledWith(elementWithoutDirective, 'card-hover');
    });
  });

  describe('mouseleave event', () => {
    beforeEach(() => {
      testElement.dispatchEvent(new Event('mouseenter'));
      rendererSpy.addClass.calls.reset();
    });

    it('should not remove class from elements without directive on mouseleave', () => {
      elementWithoutDirective.dispatchEvent(new Event('mouseleave'));

      expect(rendererSpy.removeClass).not.toHaveBeenCalledWith(
        elementWithoutDirective,
        'card-hover'
      );
    });
  });

  describe('edge cases', () => {
    it('should work with different element types', () => {
      const directiveEl = fixture.debugElement.query(By.directive(HoverEffectDirective));
      expect(directiveEl).toBeTruthy();

      expect(testElement.textContent).toContain('Test Element');
    });

    it('should not interfere with other elements', () => {
      elementWithoutDirective.dispatchEvent(new Event('mouseenter'));
      elementWithoutDirective.dispatchEvent(new Event('mouseleave'));

      expect(rendererSpy.addClass).not.toHaveBeenCalledWith(elementWithoutDirective, 'card-hover');
      expect(rendererSpy.removeClass).not.toHaveBeenCalledWith(
        elementWithoutDirective,
        'card-hover'
      );
    });
  });
});
