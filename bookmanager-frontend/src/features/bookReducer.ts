import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ReadingProgress {
    WANT_TO_READ = 'WANT_TO_READ',
    READING = 'READING',
    COMPLETED = 'COMPLETED',
}

export interface Book {
    id: number;
    title: string;
    author: string;
    publishedDate: string;
    readingProgress: ReadingProgress;
}

interface BookState {
    books: Book[];
    deletedBook: Book | null;
}

const initialState: BookState = {
    books: [],
    deletedBook: null,
};

const bookReducer = createSlice({
    name: 'books',
    initialState,
    reducers: {
        setBooks(state, action: PayloadAction<Book[]>) {
            state.books = action.payload;
        },
        addBook(state, action: PayloadAction<Book>) {
            state.books.push(action.payload);
        },
        deleteBook(state, action: PayloadAction<number>) {
            const deletedBook = state.books.find(book => book.id === action.payload);
            if (deletedBook) {
                state.deletedBook = deletedBook;
                state.books = state.books.filter(book => book.id !== action.payload);
            }
        },
        undoDeleteBook(state) {
            if (state.deletedBook) {
                state.books.push(state.deletedBook);
                state.deletedBook = null;
            }
        },
        updateBookProgress(state, action: PayloadAction<{ id: number; progress: ReadingProgress }>) {
            const book = state.books.find(book => book.id === action.payload.id);
            if (book) {
                book.readingProgress = action.payload.progress;
            }
        },
    },
});

export const { setBooks, addBook, deleteBook, undoDeleteBook, updateBookProgress } = bookReducer.actions;

export default bookReducer.reducer;
