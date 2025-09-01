import 'jest-axe/extend-expect';
import { configureAxe } from 'jest-axe';

// Configurar axe para tests de accesibilidad
export const axe = configureAxe({
  rules: {
    // Reglas específicas para el proyecto
    'color-contrast': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    'skip-link': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'focus-visible': { enabled: true },
    'tabindex': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'aria-treeitem-name': { enabled: true },
    'aria-command-name': { enabled: true },
    'aria-fieldset-name': { enabled: true },
    'aria-figure-name': { enabled: true },
    'aria-img-alt': { enabled: true },
    'aria-meter-name': { enabled: true },
    'aria-progressbar-name': { enabled: true },
    'aria-slider-name': { enabled: true },
    'aria-spinbutton-name': { enabled: true },
    'aria-switch-name': { enabled: true },
    'aria-tab-name': { enabled: true },
    'aria-textbox-name': { enabled: true },
    'aria-tooltip-name': { enabled: true },
    'aria-tree-name': { enabled: true },
    'aria-complementary-name': { enabled: true },
    'aria-form-field-multiple-labels': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-unsupported-elements': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'bypass': { enabled: true },
    'color-contrast': { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'frame-title': { enabled: true },
    'heading-order': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'html-xml-lang-mismatch': { enabled: true },
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    'label': { enabled: true },
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-main-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-no-duplicate-main': { enabled: true },
    'landmark-one-main': { enabled: true },
    'landmark-unique': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'marquee': { enabled: true },
    'meta-refresh': { enabled: true },
    'meta-viewport': { enabled: true },
    'object-alt': { enabled: true },
    'p-as-heading': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'presentation-role-conflict': { enabled: true },
    'region': { enabled: true },
    'scope-attr-valid': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
    'server-side-image-map': { enabled: true },
    'skip-link': { enabled: true },
    'tabindex': { enabled: true },
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'td-has-header': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
    'video-caption': { enabled: true },
    'video-description': { enabled: true }
  },
  // Configuración específica para el proyecto
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'best-practice']
  },
  // Configuración para idiomas
  locale: {
    lang: 'es',
    rules: {
      'html-has-lang': { enabled: true },
      'html-lang-valid': { enabled: true }
    }
  }
});

// Configurar expect para tests de accesibilidad
expect.extend({
  toHaveNoViolations(received) {
    const pass = received.violations.length === 0;
    if (pass) {
      return {
        message: () => `expected ${received} to have accessibility violations`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have no accessibility violations, but found ${received.violations.length} violations`,
        pass: false,
      };
    }
  },
});

// Configurar helpers para tests de accesibilidad
export const accessibilityHelpers = {
  // Helper para verificar navegación por teclado
  async checkKeyboardNavigation(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i];
      element.focus();
      expect(document.activeElement).toBe(element);
    }
  },

  // Helper para verificar contraste de colores
  async checkColorContrast(container) {
    const result = await axe(container);
    const contrastViolations = result.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    expect(contrastViolations).toHaveLength(0);
  },

  // Helper para verificar etiquetas
  async checkLabels(container) {
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (id) {
        const label = container.querySelector(`label[for="${id}"]`);
        expect(label).toBeTruthy();
      }
    });
  },

  // Helper para verificar roles ARIA
  async checkAriaRoles(container) {
    const result = await axe(container);
    const ariaViolations = result.violations.filter(
      violation => violation.id.startsWith('aria-')
    );
    expect(ariaViolations).toHaveLength(0);
  },

  // Helper para verificar estructura de encabezados
  async checkHeadingStructure(container) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    });
  }
};

// Configurar global helpers
global.accessibilityHelpers = accessibilityHelpers;
global.axe = axe;
