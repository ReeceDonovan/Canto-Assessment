import { Provider } from 'react-redux';

import { render, screen, waitFor } from '@testing-library/react';

import { fetchBooks } from '../api/api';
import App from '../App';
import store from '../store';

jest.mock('../components/ThemeToggle', () => {
    return {
        __esModule: true,
        default: () => null
    };
});

jest.mock('../api/api', () => ({
    fetchBooks: jest.fn(),
}));

describe('App', () => {
    beforeEach(() => {
        (fetchBooks as jest.Mock).mockResolvedValue([
            { id: 1, title: 'Book One', author: 'Author One', publishedDate: '2021-01-01' },
            { id: 2, title: 'Book Two', author: 'Author Two', publishedDate: '2022-02-02' },
        ]);
    });

    it('renders Book Management heading', async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        const headingElement = screen.getByText(/Book Management/i);
        expect(headingElement).toBeInTheDocument();
    });

    it('fetches and displays books on initial load', async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        await waitFor(() => {
            expect(fetchBooks).toHaveBeenCalled();
            // expect(screen.getByText('Book One')).toBeInTheDocument();
            // expect(screen.getByText('Book Two')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Book One')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Book Two')).toBeInTheDocument();
        });
    });

    it('renders AddBook component', () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        expect(screen.getByText('Add Book')).toBeInTheDocument();
    });

    it('renders BooksList component', () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        expect(screen.getByText('Books')).toBeInTheDocument();
    });

    it('handles API error when fetching books', async () => {
        (fetchBooks as jest.Mock).mockRejectedValue(new Error('API Error'));
        console.error = jest.fn();

        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Failed to fetch books:', expect.any(Error));
        });
    });
});
