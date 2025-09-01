import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';

expect.extend(toHaveNoViolations);

describe('Card Components', () => {
  const user = userEvent.setup();

  describe('Card Component', () => {
    it('should render card with default props', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('should render card with custom className', () => {
      render(<Card className="custom-card">Custom Card</Card>);
      
      const card = screen.getByText('Custom Card').closest('div');
      expect(card).toHaveClass('custom-card');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Ref Card</Card>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should handle click events', async () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);
      
      const card = screen.getByText('Clickable Card').closest('div');
      await user.click(card!);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<Card>Accessible Card</Card>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CardHeader Component', () => {
    it('should render card header with default props', () => {
      render(<CardHeader>Header content</CardHeader>);
      
      const header = screen.getByText('Header content').closest('div');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should render card header with custom className', () => {
      render(<CardHeader className="custom-header">Custom Header</CardHeader>);
      
      const header = screen.getByText('Custom Header').closest('div');
      expect(header).toHaveClass('custom-header');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Ref Header</CardHeader>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<CardHeader>Accessible Header</CardHeader>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CardTitle Component', () => {
    it('should render card title with default props', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByRole('heading', { name: /card title/i });
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('should render card title with custom className', () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>);
      
      const title = screen.getByRole('heading', { name: /custom title/i });
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(<CardTitle ref={ref}>Ref Title</CardTitle>);
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });

    it('should have proper heading semantics', () => {
      render(<CardTitle>Semantic Title</CardTitle>);
      
      const title = screen.getByRole('heading', { name: /semantic title/i });
      expect(title.tagName).toBe('H3');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<CardTitle>Accessible Title</CardTitle>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CardDescription Component', () => {
    it('should render card description with default props', () => {
      render(<CardDescription>Card Description</CardDescription>);
      
      const description = screen.getByText('Card Description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should render card description with custom className', () => {
      render(<CardDescription className="custom-desc">Custom Description</CardDescription>);
      
      const description = screen.getByText('Custom Description');
      expect(description).toHaveClass('custom-desc');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(<CardDescription ref={ref}>Ref Description</CardDescription>);
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });

    it('should have proper paragraph semantics', () => {
      render(<CardDescription>Semantic Description</CardDescription>);
      
      const description = screen.getByText('Semantic Description');
      expect(description.tagName).toBe('P');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<CardDescription>Accessible Description</CardDescription>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CardContent Component', () => {
    it('should render card content with default props', () => {
      render(<CardContent>Card Content</CardContent>);
      
      const content = screen.getByText('Card Content').closest('div');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should render card content with custom className', () => {
      render(<CardContent className="custom-content">Custom Content</CardContent>);
      
      const content = screen.getByText('Custom Content').closest('div');
      expect(content).toHaveClass('custom-content');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Ref Content</CardContent>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<CardContent>Accessible Content</CardContent>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CardFooter Component', () => {
    it('should render card footer with default props', () => {
      render(<CardFooter>Card Footer</CardFooter>);
      
      const footer = screen.getByText('Card Footer').closest('div');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should render card footer with custom className', () => {
      render(<CardFooter className="custom-footer">Custom Footer</CardFooter>);
      
      const footer = screen.getByText('Custom Footer').closest('div');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Ref Footer</CardFooter>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<CardFooter>Accessible Footer</CardFooter>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card Composition', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByRole('heading', { name: /complete card/i })).toBeInTheDocument();
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should handle nested card components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Parent Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Child Card</CardTitle>
              </CardHeader>
              <CardContent>Nested content</CardContent>
            </Card>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByRole('heading', { name: /parent card/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /child card/i })).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });

    it('should handle complex card layouts', () => {
      render(
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
            </CardHeader>
            <CardContent>Content 1</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card 2</CardTitle>
            </CardHeader>
            <CardContent>Content 2</CardContent>
          </Card>
        </div>
      );
      
      expect(screen.getByRole('heading', { name: /card 1/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /card 2/i })).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should have no accessibility violations in complex structure', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Complex Card</CardTitle>
            <CardDescription>Complex card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Complex content with <strong>bold text</strong> and <em>italic text</em>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button>Primary Action</button>
            <button>Secondary Action</button>
          </CardFooter>
        </Card>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Card></Card>);
      
      const card = screen.getByRole('generic');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('');
    });

    it('should handle null and undefined props', () => {
      render(<Card onClick={null} className={undefined}>Edge Case Card</Card>);
      
      const card = screen.getByText('Edge Case Card').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);
      render(<CardContent>{longContent}</CardContent>);
      
      const content = screen.getByText(longContent);
      expect(content).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Card with émojis 🚀 and symbols @#$%';
      render(<CardTitle>{specialContent}</CardTitle>);
      
      const title = screen.getByRole('heading', { name: /card with émojis/i });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(specialContent);
    });
  });

  describe('Performance', () => {
    it('should render quickly with many cards', () => {
      const startTime = performance.now();
      
      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Card {i}</CardTitle>
              </CardHeader>
              <CardContent>Content {i}</CardContent>
            </Card>
          ))}
        </div>
      );
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500); // Should render in less than 500ms
    });

    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(<Card>Initial</Card>);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        rerender(<Card>Updated {i}</Card>);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // Should re-render quickly
    });
  });

  describe('Integration', () => {
    it('should work with form elements', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Form Card</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <input type="text" name="test" />
              <button type="submit">Submit</button>
            </form>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should work with React Hook Form', () => {
      const handleSubmit = jest.fn();
      
      render(
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <input type="text" name="test" />
              <button type="submit">Submit</button>
            </form>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should work with Framer Motion', () => {
      render(
        <Card>
          <CardContent>
            <motion.div whileHover={{ scale: 1.1 }}>
              Animated Content
            </motion.div>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('Animated Content')).toBeInTheDocument();
    });
  });
});
