import { render, screen } from '@testing-library/react';
import Card from '../../components/Card';

describe('Card', () => {
  it('renders without crashing', () => {
    render(<Card />);
  });

  it('renders the description text', () => {
    render(<Card />);
    const description = screen.getByText(/Your description goes here/i);
    expect(description).toBeInTheDocument();
  });

  it('has the outer container with correct classes', () => {
    const { container } = render(<Card />);
    const outerDiv = container.firstChild as HTMLElement;

    expect(outerDiv).toHaveClass(
      'relative',
      'w-full',
      'max-w-[1200px]',
      'h-[240px]',
      'sm:h-[384px]',
      'rounded-3xl',
      'overflow-hidden',
      'shadow-2xl',
      'border',
      'border-white/10',
      'group'
    );
  });
});