import React, { act } from 'react';
import axios from 'axios';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock data for books and statistics
const mockBooks = [
  { title: 'Book 1', author: 'Author 1', description: 'Test Description 1' },
  { title: 'Book 2', author: 'Author 2', description: 'Test Description 2' },
];

const mockStatistics = {
  totalResults: 100,
  mostCommonAuthor: 'Author X',
  earliestDate: '2000-01-01',
  latestDate: '2023-12-31',
};

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { books: mockBooks, statistics: mockStatistics } }))
}));

test('renders correctly', async () => {
  axios.get.mockResolvedValue({ data: { books: mockBooks, statistics: mockStatistics, serverResponseTime: "5780ms" } });
  await act(async () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  })

});

// Test case for rendering the search form and initial content
test('renders search form and initial content', async () => {
  axios.get.mockResolvedValue({ data: { books: mockBooks, statistics: mockStatistics, serverResponseTime: "5780ms" } });
  await act(async () => {
    render(<App />);
  })

  const searchInput = screen.getByRole('textbox', { placeholder: /Search for books.../i });
  const searchButton = screen.getByRole('button', { name: /search/i });
  expect(searchInput).toBeInTheDocument();
  expect(searchButton).toBeInTheDocument();
});

// Test case for fetching books on search
test('fetches books correctly and displays results', async () => {
  axios.get.mockResolvedValue({ data: { books: mockBooks, statistics: mockStatistics, serverResponseTime: "5780ms" } });

  render(<App />);
  const searchInput = screen.getByRole('textbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  await act(async () => {
    fireEvent.change(searchInput, { target: { value: 'Book' } });
    fireEvent.click(searchButton);
  });

  expect(screen.getByText(/Author X/i)).toBeInTheDocument();
  expect(screen.getByText(/5780ms/i)).toBeInTheDocument();
});

test('displays "No books available" when books list is empty', async () => {
  const books = [];
  axios.get.mockResolvedValue({ data: { books, statistics: mockStatistics, serverResponseTime: '5ms' } });
  render(<App />);
  const searchInput = screen.getByRole('textbox');
  const searchButton = screen.getByRole('button', { name: /search/i });
  await act(() => {
    fireEvent.change(searchInput, { target: { value: 'No Books' } });
    fireEvent.click(searchButton);
  });

  expect(screen.getByText(/No books available/i)).toBeInTheDocument();
});

test('handles API error gracefully', async () => {
  axios.get.mockRejectedValue(new Error('Network Error'));

  render(<App />);
  const searchInput = screen.getByRole('textbox', { placeholder: /Search for books.../i });
  const searchButton = screen.getByRole('button', { name: /search/i });

  act(() => {
    fireEvent.change(searchInput, { target: { value: 'Error' } });
    fireEvent.click(searchButton);
  });

  await waitFor(() => {
    expect(screen.getByText(/Error fetching books/i)).toBeInTheDocument();
  });
});

test('toggles description correctly', async () => {
  axios.get.mockResolvedValue({ data: { books: mockBooks, statistics: mockStatistics, serverResponseTime: '5ms' } });
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Book 1/i)).toBeInTheDocument();
  });

  const readMoreButtons = screen.getAllByRole('button', { name: /Read More/i });
    await act(() => {
        fireEvent.click(readMoreButtons[0]); // Click the first button
    });
    expect(screen.getByRole('button', { name: /Show Less/i }).textContent).toBe('Show Less');
});