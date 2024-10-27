import { Book, ReadingProgress } from '../features/bookReducer';

const GRAPHQL_URL = window.location.origin.replace(/:\d+/, ':8080') + '/graphql';

export const fetchBooks = async (): Promise<Book[]> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `{
                findAllBooks {
                    id
                    title
                    author
                    publishedDate
                    readingProgress
                }
            }`,
        }),
    });

    const { data } = await response.json();
    return data.findAllBooks;
};

export const fetchBookById = async (id: number): Promise<Book> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `{
                findBookById {
                    id
                    title
                    author
                    publishedDate
                }
            }`,
            variables: { id: id },
        }),
    });

    const { data } = await response.json();
    return data.findBookById;
};

export const createBook = async (book: Omit<Book, 'id' | 'readingProgress'>): Promise<Book> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `mutation($title: String!, $author: String!, $publishedDate: String!) {
                createBook(title: $title, author: $author, publishedDate: $publishedDate) {
                    id
                    title
                    author
                    publishedDate
                    readingProgress
                }
            }`,
            variables: book,
        }),
    });

    const { data } = await response.json();
    return data.createBook;
};

export const deleteBook = async (id: number): Promise<number> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `mutation($id: Int!) { deleteBook(id: $id) }`,
            variables: { id: id },
        }),
    });

    const { data } = await response.json();
    return data.deleteBook;
};

export const fetchBooksByDateRange = async (startDate: string, endDate?: string): Promise<Book[]> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                query($startDate: String!, $endDate: String) {
                    findBooksByDate(startDate: $startDate, endDate: $endDate) {
                        id
                        title
                        author
                        publishedDate
                    }
                }
            `,
            variables: { startDate, endDate },
        }),
    });

    const { data } = await response.json();
    return data.findBooksByDate;
};

export const updateBookProgress = async (id: number, progress: ReadingProgress): Promise<Book> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `mutation($id: Int!, $progress: ReadingProgress!) {
                updateBookProgress(id: $id, progress: $progress) {
                    id
                    title
                    author
                    publishedDate
                    readingProgress
                }
            }`,
            variables: { id, progress },
        }),
    });

    const { data } = await response.json();
    return data.updateBookProgress;
};

export const undoDeleteBook = async (id: number): Promise<Book> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                mutation($id: Int!) {
                    undoDeleteBook(id: $id) {
                        id
                        title
                        author
                        publishedDate
                        readingProgress
                    }
                }
            `,
            variables: { id },
        }),
    });

    const { data } = await response.json();
    return data.undoDeleteBook;
};
