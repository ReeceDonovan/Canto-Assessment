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
            <Header />
            <Main />
        </div>
    );
};

const Header: React.FC = () => (
    <header>
        <div className="w-fit" aria-label="Theme toggle">
            <ThemeToggle />
        </div>
    </header>
);

const Main: React.FC = () => (
    <main className="pt-12 size-min sm:size-fit mx-auto w-auto" role="main" aria-labelledby="main-heading">
        <h1 id="main-heading" className="text-3xl sm:text-4xl text-center sm:text-left font-bold text-gray-800 dark:text-gray-200 mb-8">Book Management</h1>
        <section aria-label="Add new book">
            <AddBook />
        </section>
        <section aria-label="Book list">
            <BooksList />
        </section>
    </main>
);

export default App;
