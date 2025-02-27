import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
    deleteBook as deleteBookAPI, fetchBooks, fetchBooksByDateRange,
    undoDeleteBook as undoDeleteBookAPI, updateBookProgress as updateBookProgressAPI
} from '../../api/api';
import BooksList from '../../components/BooksList';
import booksReducer, { ReadingProgress } from '../../features/bookReducer';
import { RootState } from '../../store';

jest.mock('../../api/api', () => ({
    deleteBook: jest.fn(),
    fetchBooks: jest.fn(),
    fetchBooksByDateRange: jest.fn(),
    updateBookProgress: jest.fn(),
    undoDeleteBook: jest.fn(),
}));

jest.setTimeout(10000);

describe('BooksList', () => {
    let store: ReturnType<typeof configureStore>;
    let initialState: RootState;

    beforeEach(() => {
        initialState = {
            books: {
                books: [
                    { id: 1, title: 'Book One', author: 'Author One', publishedDate: '2021-01-01', readingProgress: ReadingProgress.WANT_TO_READ },
                    { id: 2, title: 'Book Two', author: 'Author Two', publishedDate: '2022-02-02', readingProgress: ReadingProgress.READING },
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

    it('should render a list of books with reading progress', () => {
        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        expect(screen.getByText('Books')).toBeInTheDocument();
        expect(screen.getByText('Book One')).toBeInTheDocument();
        expect(screen.getByText('Book Two')).toBeInTheDocument();

        // Check for the first book's reading progress
        const firstBookSelect = screen.getAllByLabelText('Reading Progress')[0] as HTMLSelectElement;
        expect(firstBookSelect.value).toBe(ReadingProgress.WANT_TO_READ);

        // Check for the second book's reading progress
        const secondBookSelect = screen.getAllByLabelText('Reading Progress')[1] as HTMLSelectElement;
        expect(secondBookSelect.value).toBe(ReadingProgress.READING);
    });

    it('should update reading progress when selection changes', async () => {
        (updateBookProgressAPI as jest.Mock).mockResolvedValue({
            ...initialState.books.books[0],
            readingProgress: ReadingProgress.COMPLETED,
        });

        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        const progressSelect = screen.getAllByLabelText('Reading Progress')[0];
        fireEvent.change(progressSelect, { target: { value: ReadingProgress.COMPLETED } });

        await waitFor(() => {
            expect(updateBookProgressAPI).toHaveBeenCalledWith(1, ReadingProgress.COMPLETED);
        });

        await waitFor(() => {
            expect(screen.getAllByText('COMPLETED')[0]).toBeInTheDocument();
        });
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

    it('should show undo button when a book is deleted', async () => {
        (deleteBookAPI as jest.Mock).mockResolvedValue(1);

        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        const deleteButton = screen.getAllByLabelText(/Delete/)[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Book deleted')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Undo')).toBeInTheDocument();
        });
    });

    it('should hide undo button after 5 seconds', async () => {
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

        await new Promise(resolve => setTimeout(resolve, 5000));

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
        (undoDeleteBookAPI as jest.Mock).mockResolvedValue(initialState.books.books[0]);

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

        expect(undoDeleteBookAPI).toHaveBeenCalledWith(1);
    });

    it('should handle undo deletion failure', async () => {
        (deleteBookAPI as jest.Mock).mockResolvedValue(1);
        (undoDeleteBookAPI as jest.Mock).mockRejectedValue(new Error('Failed to undo delete'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

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
            expect(consoleSpy).toHaveBeenCalledWith('Failed to undo delete:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('should filter books by date range', async () => {
        const filteredBooks = [{ id: 1, title: 'Book One', author: 'Author One', publishedDate: '2021-01-01', readingProgress: ReadingProgress.WANT_TO_READ }];
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
