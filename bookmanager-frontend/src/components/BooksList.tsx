import { Book, Calendar, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    deleteBook as deleteBookAPI, fetchBooks, fetchBooksByDateRange,
    undoDeleteBook as undoDeleteBookAPI, updateBookProgress as updateBookProgressAPI
} from '../api/api';
import {
    deleteBook, ReadingProgress, setBooks, undoDeleteBook, updateBookProgress
} from '../features/bookReducer';
import { RootState } from '../store';

const BooksList = () => {
    const books = useSelector((state: RootState) => state.books.books);
    const deletedBook = useSelector((state: RootState) => state.books.deletedBook);
    const dispatch = useDispatch();
    const [isUndoVisible, setIsUndoVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleDateFilter = useCallback(async () => {
        try {
            let filteredBooks;
            if (startDate || endDate) {
                const defaultStartDate = '1900-01-01';
                const defaultEndDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

                const effectiveStartDate = startDate || defaultStartDate;
                const effectiveEndDate = endDate || defaultEndDate;

                filteredBooks = await fetchBooksByDateRange(effectiveStartDate, effectiveEndDate);
            } else {
                // If both dates are empty, fetch all books
                filteredBooks = await fetchBooks();
            }
            dispatch(setBooks(filteredBooks));
        } catch (error) {
            console.error('Failed to fetch books:', error);
        }
    }, [startDate, endDate, dispatch]);

    useEffect(() => {
        handleDateFilter();
    }, [handleDateFilter]);

    const handleDeleteBook = async (id: number) => {
        dispatch(deleteBook(id));
        setIsUndoVisible(true);

        try {
            await deleteBookAPI(id);
            // Hide undo button after successful deletion
            setTimeout(() => setIsUndoVisible(false), 5000);
        } catch (error) {
            console.error('Failed to delete book:', error);
            dispatch(undoDeleteBook());
            setIsUndoVisible(false);
        }
    };

    const handleUndoDelete = async () => {
        if (deletedBook) {
            try {
                const restoredBook = await undoDeleteBookAPI(deletedBook.id);
                dispatch(undoDeleteBook());
                dispatch(setBooks([...books, restoredBook]));
                setIsUndoVisible(false);
            } catch (error) {
                console.error('Failed to undo delete:', error);
            }
        }
    };

    const handleProgressChange = async (id: number, progress: ReadingProgress) => {
        try {
            const updatedBook = await updateBookProgressAPI(id, progress);
            dispatch(updateBookProgress({ id, progress: updatedBook.readingProgress }));
        } catch (error) {
            console.error('Failed to update book progress:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Books</h2>

            {/* Date filter inputs */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0" role="search" aria-label="Filter books by date">
                <div className="flex items-center">
                    <label htmlFor="startDate" className="sr-only">Start Date</label>
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" aria-hidden="true" />
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        data-testid="startDate"
                        className="border rounded p-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900/50 dark:text-gray-300/70 w-full sm:w-auto"
                        aria-label="Start Date"
                    />
                </div>
                <div className="flex items-center">
                    <label htmlFor="endDate" className="sr-only">End Date</label>
                    <span className="text-gray-500 dark:text-gray-400 mr-2 sm:mx-2" aria-hidden="true">to</span>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded p-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900/50 dark:text-gray-300/70 w-full sm:w-auto"
                        data-testid="endDate"
                        aria-label="End Date"
                    />
                </div>
                <button
                    onClick={() => {
                        setStartDate('');
                        setEndDate('');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 w-full sm:w-auto text-center sm:text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded sm:ml-3"
                    aria-label="Clear date filter"
                >
                    Clear
                </button>
            </div>

            {/* Horizontal divider */}
            <hr className="border-t border-gray-200 dark:border-gray-700 mb-6" aria-hidden="true" />

            {/* Undo delete notification */}
            {isUndoVisible && deletedBook && (
                <div className="mb-4 flex items-center justify-between bg-blue-100 dark:bg-blue-900 p-2 rounded" role="alert">
                    <span className="text-blue-800 dark:text-blue-200">Book deleted</span>
                    <button
                        onClick={handleUndoDelete}
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded p-1"
                        aria-label="Undo delete"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" aria-hidden="true" />
                        Undo
                    </button>
                </div>
            )}

            {/* Book list */}
            <ul className="space-y-4" aria-label="List of books">
                {books.map(book => (
                    <li key={book.id} className="flex items-start justify-between space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex items-start space-x-4">
                            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" aria-hidden="true" />
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-gray-100">{book.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    <span className="whitespace-nowrap">Published: {book.publishedDate}</span>
                                </p>
                                <div className="mt-2">
                                    <label htmlFor={`progress-${book.id}`} className="sr-only">Reading Progress</label>
                                    <select
                                        id={`progress-${book.id}`}
                                        value={book.readingProgress}
                                        onChange={(e) => handleProgressChange(book.id, e.target.value as ReadingProgress)}
                                        className="mt-1 block w-full pl-3 pr-2 sm:pr-10 py-2 text-base border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-white"
                                    >
                                        {Object.values(ReadingProgress).map((progress) => (
                                            <option key={progress} value={progress}>
                                                {progress.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* Delete button */}
                        <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 sm:p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                            aria-label={`Delete ${book.title}`}
                        >
                            <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BooksList;
