import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

const BooksList = () => {
    const books = useSelector((state: RootState) => state.books.books);

    return (
        <div>
            <h2>Books</h2>
            <ul>
                {books.map(book => (
                    <li key={book.id}>
                        {book.title} by {book.author} (Published: {book.publishedDate})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BooksList;
