import { Book, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { deleteBook as deleteBookAPI } from '../api/api';
import { deleteBook, undoDeleteBook } from '../features/bookReducer';
import { RootState } from '../store';

const BooksList = () => {
    const books = useSelector((state: RootState) => state.books.books);
    const deletedBook = useSelector((state: RootState) => state.books.deletedBook);
    const dispatch = useDispatch();
    const [isUndoVisible, setIsUndoVisible] = useState(false);

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
