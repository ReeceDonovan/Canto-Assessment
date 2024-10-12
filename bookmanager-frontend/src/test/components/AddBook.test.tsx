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

describe('BooksList', () => {
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
        });
        expect(authorInput).toHaveValue('');
        expect(publishedDateInput).toHaveValue('');
    });
});
