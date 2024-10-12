import { Book, Calendar, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { deleteBook as deleteBookAPI, fetchBooks, fetchBooksByDateRange } from '../api/api';
import { deleteBook, setBooks, undoDeleteBook } from '../features/bookReducer';
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

    const handleUndoDelete = () => {
        dispatch(undoDeleteBook());
        setIsUndoVisible(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Books</h2>

            {/* Date filter inputs */}
            <div className="mb-4 flex items-center space-x-4">
                <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded p-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900/50 dark:text-gray-300/70"
                    />
                </div>
                <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mx-2">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded p-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900/50 dark:text-gray-300/70"
                    />
                </div>
                <button
                    onClick={() => {
                        setStartDate('');
                        setEndDate('');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                    Clear
                </button>
            </div>

            {/* Undo delete notification */}
            {isUndoVisible && deletedBook && (
                <div className="mb-4 flex items-center justify-between bg-blue-100 dark:bg-blue-900 p-2 rounded">
                    <span className="text-blue-800 dark:text-blue-200">Book deleted</span>
                    <button
                        onClick={handleUndoDelete}
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Undo
                    </button>
                </div>
            )}

            {/* Book list */}
            <ul className="space-y-4">
                {books.map(book => (
                    <li key={book.id} className="flex items-start justify-between space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex items-start space-x-4">
                            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-gray-100">{book.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">by {book.author}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">Published: {book.publishedDate}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                            aria-label={`Delete ${book.title}`}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BooksList;
