import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { deleteBook as deleteBookAPI, fetchBooks, fetchBooksByDateRange } from '../../api/api';
import BooksList from '../../components/BooksList';
import booksReducer from '../../features/bookReducer';
import { RootState } from '../../store';

jest.mock('../../api/api', () => ({
    deleteBook: jest.fn(),
    fetchBooks: jest.fn(),
    fetchBooksByDateRange: jest.fn(),
}));

jest.setTimeout(10000);

describe('BooksList', () => {
    let store: ReturnType<typeof configureStore>;
    let initialState: RootState;

    beforeEach(() => {
        initialState = {
            books: {
                books: [
                    { id: 1, title: 'Book One', author: 'Author One', publishedDate: '2021-01-01' },
                    { id: 2, title: 'Book Two', author: 'Author Two', publishedDate: '2022-02-02' },
                ],
                deletedBook: null,
            },
        };
        store = configureStore({
            reducer: {
                books: booksReducer,
            },
            preloadedState: initialState,
        });
        (fetchBooks as jest.Mock).mockResolvedValue(initialState.books.books);
        (fetchBooksByDateRange as jest.Mock).mockResolvedValue(initialState.books.books);
    });

    it('should render a list of books', () => {
        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        expect(screen.getByText('Books')).toBeInTheDocument();
        expect(screen.getByText('Book One')).toBeInTheDocument();
        expect(screen.getByText('Book Two')).toBeInTheDocument();
    });

    it('should immediately remove a book from UI when delete button is clicked', async () => {
        (deleteBookAPI as jest.Mock).mockResolvedValue(1);

        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        const deleteButtons = screen.getAllByLabelText(/Delete/);
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Book One')).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Book Two')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(deleteBookAPI).toHaveBeenCalledWith(1);
        });
    });

    it('should show and hide undo button when a book is deleted', async () => {
        (deleteBookAPI as jest.Mock).mockResolvedValue(1);

        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        const deleteButtons = screen.getAllByLabelText(/Delete/);
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText('Book deleted')).toBeInTheDocument();
        expect(screen.getByText('Undo')).toBeInTheDocument();

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await waitFor(() => {
            expect(screen.queryByText('Book deleted')).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByText('Undo')).not.toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    it('should undo book deletion when undo button is clicked', async () => {
        (deleteBookAPI as jest.Mock).mockResolvedValue(1);

        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        const deleteButtons = screen.getAllByLabelText(/Delete/);
        fireEvent.click(deleteButtons[0]);

        const undoButton = screen.getByText('Undo');
        fireEvent.click(undoButton);

        await waitFor(() => {
            expect(screen.getByText('Book One')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByText('Book deleted')).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByText('Undo')).not.toBeInTheDocument();
        });
    });

    it('should filter books by date range', async () => {
        const filteredBooks = [{ id: 1, title: 'Book One', author: 'Author One', publishedDate: '2021-01-01' }];
        (fetchBooksByDateRange as jest.Mock).mockResolvedValue(filteredBooks);

        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        const startDateInput = screen.getByTestId('startDate');
        const endDateInput = screen.getByTestId('endDate');

        fireEvent.change(startDateInput, { target: { value: '2021-01-01' } });
        fireEvent.change(endDateInput, { target: { value: '2021-12-31' } });

        await waitFor(() => {
            expect(fetchBooksByDateRange).toHaveBeenCalledWith('2021-01-01', '2021-12-31');
        });

        await waitFor(() => {
            expect(screen.getByText('Book One')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByText('Book Two')).not.toBeInTheDocument();
        });
    });

    it('should clear date filters when clear button is clicked', async () => {
        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        const startDateInput = screen.getByTestId('startDate');
        const endDateInput = screen.getByTestId('endDate');
        const clearButton = screen.getByText('Clear');

        fireEvent.change(startDateInput, { target: { value: '2021-01-01' } });
        fireEvent.change(endDateInput, { target: { value: '2021-12-31' } });

        fireEvent.click(clearButton);

        await waitFor(() => {
            expect(startDateInput).toHaveValue('');
        });

        await waitFor(() => {
            expect(endDateInput).toHaveValue('');
        });

        await waitFor(() => {
            expect(fetchBooks).toHaveBeenCalled();
        });
    });
});
