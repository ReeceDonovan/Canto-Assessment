import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { fetchBooks } from './api/api';
import AddBook from './components/AddBook';
import BooksList from './components/BooksList';
import { setBooks } from './features/bookReducer';

const App: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const loadBooks = async () => {
            const books = await fetchBooks();
            dispatch(setBooks(books));
        };

        loadBooks();
    }, [dispatch]);

    return (
        <div>
            <h1>Book Management</h1>
            <AddBook/>
            <BooksList/>
        </div>
    );
};

export default App;

