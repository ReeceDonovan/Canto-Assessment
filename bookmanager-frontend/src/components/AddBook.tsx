import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { createBook } from '../api/api';
import { addBook } from '../features/bookReducer';
import { useBookForm } from '../hooks/useBookForm';

const AddBook: React.FC = () => {
    const dispatch = useDispatch();
    const { formData, handleInputChange, resetForm } = useBookForm();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { title, author, publishedDate } = formData;
        if (title && author && publishedDate) {
            try {
                const newBook = await createBook(formData);
                dispatch(addBook(newBook));
                resetForm();
            } catch (error) {
                console.error('Failed to add book:', error);
                alert('Failed to add book. Please try again.');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 max-w-[calc(100vw-2rem)] mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Add Book</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['title', 'author', 'publishedDate'].map((field) => (
                        <InputField
                            key={field}
                            id={field}
                            type={field === 'publishedDate' ? 'date' : 'text'}
                            value={formData[field as keyof typeof formData]}
                            onChange={handleInputChange}
                        />
                    ))}
                </div>
                <SubmitButton />
            </form>
        </div>
    );
};

interface InputFieldProps {
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ id, type, value, onChange }) => (
    <div>
        <label htmlFor={id} className="sr-only">{id.charAt(0).toUpperCase() + id.slice(1)}</label>
        <input
            id={id}
            type={type}
            placeholder={id.charAt(0).toUpperCase() + id.slice(1)}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900/50 dark:text-gray-300/70"
            required
            aria-label={`Book ${id.charAt(0).toUpperCase() + id.slice(1)}`}
            min={type === 'date' ? "1900-01-01" : undefined}
        />
    </div>
);

const SubmitButton: React.FC = () => (
    <button
        type="submit"
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300 flex items-center justify-center"
        aria-label="Add Book"
    >
        <PlusCircle className="w-5 h-5 mr-2" aria-hidden="true" />
        Add
    </button>
);

export default AddBook;
