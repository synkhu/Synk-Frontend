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

  it('renders a div with the background image', () => {
    render(<Card />);
    const bgDiv = document.querySelector(
      'div[style*="background-image"]'
    );
    expect(bgDiv).toHaveStyle(
      'background-image: url(https://independentaustralia.net/_lib/slir/w800-c660x434/i/article/img/article-19811-hero.jpg?t=1749265169)'
    );
  });
});