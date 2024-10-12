import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { createBook } from '../../api/api';
import AddBook from '../../components/AddBook';
import booksReducer from '../../features/bookReducer';

jest.mock('../../api/api');
jest.mock('../../features/bookReducer', () => ({
    addBook: jest.fn(),
}));

describe('AddBook', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                books: booksReducer,
            },
        });
        store.dispatch = jest.fn();
        (createBook as jest.Mock).mockResolvedValue({ id: 1, title: 'Test Book', author: 'Test Author', publishedDate: '2023-01-01' });
    });

    it('should render the form correctly', () => {
        render(
            <Provider store={store}>
                <AddBook />
            </Provider>
        );

        expect(screen.getByText('Add Book')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Author')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Published Date')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('should clear title, author and publishedDate when a book is added', async () => {
        render(
            <Provider store={store}>
                <AddBook />
            </Provider>
        );

        const titleInput = screen.getByPlaceholderText('Title');
        const authorInput = screen.getByPlaceholderText('Author');
        const publishedDateInput = screen.getByPlaceholderText('Published Date');
        const addButton = screen.getByText('Add');

        fireEvent.change(titleInput, { target: { value: 'Test Book' } });
        fireEvent.change(authorInput, { target: { value: 'Test Author' } });
        fireEvent.change(publishedDateInput, { target: { value: '2023-01-01' } });

        fireEvent.click(addButton);

        await waitFor(() => {
            expect(titleInput).toHaveValue('');
            // expect(authorInput).toHaveValue('');
            // expect(publishedDateInput).toHaveValue('');
        });

        await waitFor(() => {
            expect(authorInput).toHaveValue('');
        });

        await waitFor(() => {
            expect(publishedDateInput).toHaveValue('');
        });
    });

    it('should not submit the form if any field is empty', async () => {
        render(
            <Provider store={store}>
                <AddBook />
            </Provider>
        );

        const addButton = screen.getByText('Add');

        fireEvent.click(addButton);

        await waitFor(() => {
            expect(createBook).not.toHaveBeenCalled();
            // expect(store.dispatch).not.toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(store.dispatch).not.toHaveBeenCalled();
        });
    });

    it('should handle API error when adding a book', async () => {
        (createBook as jest.Mock).mockRejectedValue(new Error('API Error'));
        console.error = jest.fn();

        render(
            <Provider store={store}>
                <AddBook />
            </Provider>
        );

        const titleInput = screen.getByPlaceholderText('Title');
        const authorInput = screen.getByPlaceholderText('Author');
        const publishedDateInput = screen.getByPlaceholderText('Published Date');
        const addButton = screen.getByText('Add');

        fireEvent.change(titleInput, { target: { value: 'Test Book' } });
        fireEvent.change(authorInput, { target: { value: 'Test Author' } });
        fireEvent.change(publishedDateInput, { target: { value: '2023-01-01' } });

        fireEvent.click(addButton);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Failed to add book:', expect.any(Error));
            // expect(store.dispatch).not.toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(store.dispatch).not.toHaveBeenCalled();
        });
    });
});
