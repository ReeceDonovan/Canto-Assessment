import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import BooksList from '../../components/BooksList';
import booksReducer from '../../features/bookReducer';
import { RootState } from '../../store';

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
        
        // Check for individual elements instead of the entire string
        expect(screen.getByText('Book One')).toBeInTheDocument();
        expect(screen.getByText('by Author One')).toBeInTheDocument();
        expect(screen.getByText('Published: 2021-01-01')).toBeInTheDocument();

        expect(screen.getByText('Book Two')).toBeInTheDocument();
        expect(screen.getByText('by Author Two')).toBeInTheDocument();
        expect(screen.getByText('Published: 2022-02-02')).toBeInTheDocument();
    });
});
