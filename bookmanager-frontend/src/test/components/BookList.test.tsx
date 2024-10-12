import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { deleteBook as deleteBookAPI } from '../../api/api';
import BooksList from '../../components/BooksList';
import booksReducer from '../../features/bookReducer';
import { RootState } from '../../store';

jest.mock('../../api/api', () => ({
    deleteBook: jest.fn(),
}));

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
    });

    it('should render a list of books', () => {
        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        expect(screen.getByText('Books')).toBeInTheDocument();

        expect(screen.getByText('Book One')).toBeInTheDocument();
        expect(screen.getByText('by Author One')).toBeInTheDocument();
        expect(screen.getByText('Published: 2021-01-01')).toBeInTheDocument();

        expect(screen.getByText('Book Two')).toBeInTheDocument();
        expect(screen.getByText('by Author Two')).toBeInTheDocument();
        expect(screen.getByText('Published: 2022-02-02')).toBeInTheDocument();
    });

    it('should immediately remove a book from UI when delete button is clicked', () => {
        (deleteBookAPI as jest.Mock).mockResolvedValue(1);

        render(
            <Provider store={store}>
                <BooksList />
            </Provider>
        );

        expect(screen.getByText('Book One')).toBeInTheDocument();

        const deleteButtons = screen.getAllByLabelText(/Delete/);
        fireEvent.click(deleteButtons[0]);

        // Check that the book is immediately removed from the UI
        expect(screen.queryByText('Book One')).not.toBeInTheDocument();
        expect(screen.getByText('Book Two')).toBeInTheDocument();

        // Verify that the API was called
        expect(deleteBookAPI).toHaveBeenCalledWith(1);
    });

    it('should show undo button when a book is deleted', async () => {
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

        expect(screen.getByText('Book One')).toBeInTheDocument();
        expect(screen.queryByText('Book deleted')).not.toBeInTheDocument();
        expect(screen.queryByText('Undo')).not.toBeInTheDocument();
    });
});
