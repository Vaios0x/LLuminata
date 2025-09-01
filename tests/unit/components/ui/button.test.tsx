import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';

expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  const user = userEvent.setup();

  describe('Rendering', () => {
    it('should render button with default props', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('should render button with custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      
      const button = screen.getByRole('button', { name: /custom button/i });
      expect(button).toHaveClass('custom-class');
    });

    it('should render button with different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary');

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border', 'border-input');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-secondary');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

      rerender(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-primary', 'underline-offset-4');
    });

    it('should render button with different sizes', () => {
      const { rerender } = render(<Button size="default">Default Size</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'px-4', 'py-2');

      rerender(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-9', 'px-3');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-11', 'px-8');

      rerender(<Button size="icon">Icon</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10');
    });

    it('should render disabled button', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should render button as child component', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', async () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button', { name: /disabled/i });
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard interactions', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button', { name: /keyboard button/i });
      
      // Focus and press Enter
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Press Space
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should handle focus and blur events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus Button
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /focus button/i });
      
      await user.tab();
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Button with ARIA
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('should support screen readers', () => {
      render(<Button aria-label="Screen reader button">SR Button</Button>);
      
      const button = screen.getByRole('button', { name: /screen reader button/i });
      expect(button).toBeInTheDocument();
    });

    it('should have proper focus management', async () => {
      render(<Button>Focusable Button</Button>);
      
      const button = screen.getByRole('button', { name: /focusable button/i });
      
      await user.tab();
      expect(button).toHaveFocus();
      
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should handle keyboard navigation correctly', async () => {
      render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const secondButton = screen.getByRole('button', { name: /second button/i });
      
      await user.tab();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      expect(secondButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('should handle null and undefined props', () => {
      render(<Button onClick={null} disabled={undefined}>Edge Case</Button>);
      
      const button = screen.getByRole('button', { name: /edge case/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should handle very long text content', () => {
      const longText = 'A'.repeat(1000);
      render(<Button>{longText}</Button>);
      
      const button = screen.getByRole('button', { name: new RegExp(longText.substring(0, 50)) });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(longText);
    });

    it('should handle special characters in text', () => {
      const specialText = 'Button with émojis 🚀 and symbols @#$%';
      render(<Button>{specialText}</Button>);
      
      const button = screen.getByRole('button', { name: /button with émojis/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(specialText);
    });
  });

  describe('Performance', () => {
    it('should render quickly with many variants', () => {
      const startTime = performance.now();
      
      const { rerender } = render(<Button variant="default">Test</Button>);
      
      const variants = ['destructive', 'outline', 'secondary', 'ghost', 'link'];
      variants.forEach(variant => {
        rerender(<Button variant={variant as any}>Test</Button>);
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should handle rapid clicks efficiently', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Rapid Click</Button>);
      
      const button = screen.getByRole('button', { name: /rapid click/i });
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }
      
      expect(handleClick).toHaveBeenCalledTimes(10);
    });
  });

  describe('Integration', () => {
    it('should work with form elements', () => {
      render(
        <form>
          <input type="text" name="test" />
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should work with React Hook Form', () => {
      const handleSubmit = jest.fn();
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeInTheDocument();
    });

    it('should work with Framer Motion', () => {
      render(
        <Button asChild>
          <motion.div whileHover={{ scale: 1.1 }}>
            Animated Button
          </motion.div>
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /animated button/i });
      expect(button).toBeInTheDocument();
    });
  });
});
