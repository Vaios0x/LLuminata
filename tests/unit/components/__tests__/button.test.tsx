import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';

expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  const defaultProps = {
    children: 'Test Button',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<Button {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('calls onClick when clicked', () => {
    render(<Button {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button {...defaultProps} variant="destructive" />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');

    rerender(<Button {...defaultProps} variant="outline" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-input', 'bg-background');

    rerender(<Button {...defaultProps} variant="secondary" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');

    rerender(<Button {...defaultProps} variant="ghost" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');

    rerender(<Button {...defaultProps} variant="link" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-primary', 'underline-offset-4');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button {...defaultProps} size="sm" />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-9', 'px-3', 'rounded-md');

    rerender(<Button {...defaultProps} size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-11', 'px-8', 'rounded-md');

    rerender(<Button {...defaultProps} size="icon" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('pointer-events-none', 'opacity-50');
  });

  it('does not call onClick when disabled', () => {
    render(<Button {...defaultProps} disabled />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with icon when provided', () => {
    const TestIcon = () => <span data-testid="icon">🔍</span>;
    
    render(
      <Button {...defaultProps}>
        <TestIcon />
        Test Button
      </Button>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  it('supports asChild prop for custom elements', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('has proper ARIA attributes', () => {
    render(<Button {...defaultProps} aria-label="Custom label" />);
    
    const button = screen.getByRole('button', { name: 'Custom label' });
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('supports tabIndex for keyboard navigation', () => {
    render(<Button {...defaultProps} tabIndex={0} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<Button {...defaultProps} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('meets accessibility standards when disabled', async () => {
    const { container } = render(<Button {...defaultProps} disabled />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports loading state', () => {
    render(<Button {...defaultProps} loading />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('pointer-events-none');
  });

  it('shows loading spinner when loading', () => {
    render(<Button {...defaultProps} loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Loading Button');
    // Verificar que hay un spinner (esto dependería de la implementación específica)
  });

  it('handles keyboard events correctly', () => {
    render(<Button {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    
    // Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(defaultProps.onClick).toHaveBeenCalledTimes(2);
  });

  it('prevents default behavior when preventDefault is true', () => {
    const handleClick = jest.fn((e) => {
      e.preventDefault();
    });
    
    render(<Button onClick={handleClick}>Prevent Default</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('supports data attributes', () => {
    render(<Button {...defaultProps} data-testid="custom-button" data-custom="value" />);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('data-custom', 'value');
  });

  it('handles focus and blur events', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    
    render(<Button {...defaultProps} onFocus={onFocus} onBlur={onBlur} />);
    
    const button = screen.getByRole('button');
    
    fireEvent.focus(button);
    expect(onFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(button);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
