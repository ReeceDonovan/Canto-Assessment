import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { createBook } from '../api/api';
import { addBook } from '../features/bookReducer';

const AddBook = () => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publishedDate, setPublishedDate] = useState('');

    const handleAddBook = async () => {
        const newBook = await createBook({title, author, publishedDate});
        dispatch(addBook(newBook));
        setTitle('');
        setAuthor('');
        setPublishedDate('');
    };

    return (
        <div>
            <h2>Add Book</h2>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
            />
            <input
                type="date"
                placeholder="Published Date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
            />
            <button onClick={handleAddBook}>Add</button>
        </div>
    );
};

export default AddBook;
