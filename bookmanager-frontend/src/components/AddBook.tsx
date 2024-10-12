import { PlusCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';

import { createBook } from '../api/api';
import { addBook } from '../features/bookReducer';

const AddBook = () => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publishedDate, setPublishedDate] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (title && author && publishedDate) {
            try {
                const newBook = await createBook({ title, author, publishedDate });
                dispatch(addBook(newBook));
                setTitle('');
                setAuthor('');
                setPublishedDate('');
            } catch (error) {
                console.error('Failed to add book:', error);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 max-w-[calc(100vw-2rem)] mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Add Book</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="title" className="sr-only">Title</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                            aria-label="Book Title"
                        />
                    </div>
                    <div>
                        <label htmlFor="author" className="sr-only">Author</label>
                        <input
                            id="author"
                            type="text"
                            placeholder="Author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                            aria-label="Book Author"
                        />
                    </div>
                    <div>
                        <label htmlFor="publishedDate" className="sr-only">Published Date</label>
                        <input
                            id="publishedDate"
                            type="date"
                            placeholder="Published Date"
                            min="1900-01-01"
                            value={publishedDate}
                            onChange={(e) => setPublishedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            required
                            aria-label="Published Date"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300 flex items-center justify-center"
                    aria-label="Add Book"
                >
                    <PlusCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                    Add
                </button>
            </form>
        </div>
    );
};

export default AddBook;
