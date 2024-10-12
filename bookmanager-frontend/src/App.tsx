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
            try {
                const books = await fetchBooks();
                dispatch(setBooks(books));
            } catch (error) {
                console.error('Failed to fetch books:', error);
            }
        };

        loadBooks();
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 antialiased mx-auto w-full max-w-screen">
            <div className="w-fit">
                <ThemeToggle />
            </div>
            <main className="pt-12 size-min sm:size-fit mx-auto w-auto">
                <h1 className="text-3xl sm:text-4xl text-center sm:text-left font-bold text-gray-800 dark:text-gray-200 mb-8">Book Management</h1>
                <AddBook />
                <BooksList />
            </main>
        </div>
    );
};

export default App;
