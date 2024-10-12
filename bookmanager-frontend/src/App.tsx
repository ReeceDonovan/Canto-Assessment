import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { fetchBooks } from './api/api';
import AddBook from './components/AddBook';
import BooksList from './components/BooksList';
import ThemeToggle from './components/ThemeToggle';
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 antialiased mx-auto w-full">
            <div className="w-fit">
                <ThemeToggle />
            </div>
            <div className="pt-12 size-fit mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">Book Management</h1>
                <AddBook />
                <BooksList />
            </div>
        </div>
    );
};

export default App;
