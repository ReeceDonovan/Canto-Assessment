package com.acme.bookmanagement.service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.acme.bookmanagement.model.Book;
import com.acme.bookmanagement.repository.BookRepository;

class BookServiceTest {
    private BookRepository bookRepository;
    private BookService bookService;

    private final Book book1 = new Book(1L, "title-1", "author-1", LocalDate.of(2021, 2, 3));
    private final Book book2 = new Book(2L, "title-2", "author-2", LocalDate.of(2022, 3, 4));

    @BeforeEach
    void setUp() {
        bookRepository = Mockito.mock(BookRepository.class);
        bookService = new BookService(bookRepository);
    }

    @Test
    void testFindAll() {
        when(bookRepository.findAll()).thenReturn(Arrays.asList(book1, book2));
        List<Book> result = bookService.findAll();
        assertEquals(2, result.size());
        assertTrue(result.contains(book1));
        assertTrue(result.contains(book2));
    }

    @Test
    void testFindAllEmpty() {
        when(bookRepository.findAll()).thenReturn(Collections.emptyList());
        List<Book> result = bookService.findAll();
        assertTrue(result.isEmpty());
    }

    @Test
    void testFindById() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book1));
        Optional<Book> result = bookService.findById(1L);
        assertTrue(result.isPresent());
        assertEquals(book1, result.get());
    }

    @Test
    void testFindByIdNotFound() {
        when(bookRepository.findById(3L)).thenReturn(Optional.empty());
        Optional<Book> result = bookService.findById(3L);
        assertFalse(result.isPresent());
    }

    @Test
    void testSave() {
        Book newBook = new Book(null, "new-title", "new-author", LocalDate.now());
        Book savedBook = new Book(3L, "new-title", "new-author", LocalDate.now());
        when(bookRepository.save(newBook)).thenReturn(savedBook);
        Book result = bookService.save(newBook);
        assertEquals(savedBook, result);
    }

    @Test
    void testDeleteById() {
        Long bookId = 1L;
        Book book = new Book(bookId, "title-1", "author-1", LocalDate.of(2021, 2, 3));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

        Long deletedId = bookService.deleteById(bookId);

        assertEquals(bookId, deletedId);
        verify(bookRepository, times(1)).findById(bookId);
        verify(bookRepository, times(1)).deleteById(bookId);
    }

    @Test
    void testDeleteByIdBookNotFound() {
        Long bookId = 1L;
        when(bookRepository.findById(bookId)).thenReturn(Optional.empty());

        Long deletedId = bookService.deleteById(bookId);

        assertEquals(bookId, deletedId);
        verify(bookRepository, times(1)).findById(bookId);
        verify(bookRepository, never()).deleteById(bookId);
    }

    @Test
    void testFindBooksByDateRange() {
        LocalDate startDate = LocalDate.of(2021, 1, 1);
        LocalDate endDate = LocalDate.of(2022, 12, 31);
        when(bookRepository.findAll()).thenReturn(Arrays.asList(book1, book2));

        List<Book> result = bookService.findBooksByDateRange(startDate, endDate);
        assertEquals(2, result.size());
        assertTrue(result.contains(book1));
        assertTrue(result.contains(book2));
    }

    @Test
    void testFindBooksByDateRangeNoResults() {
        LocalDate startDate = LocalDate.of(2023, 1, 1);
        LocalDate endDate = LocalDate.of(2023, 12, 31);
        when(bookRepository.findAll()).thenReturn(Arrays.asList(book1, book2));

        List<Book> result = bookService.findBooksByDateRange(startDate, endDate);
        assertTrue(result.isEmpty());
    }

    @Test
    void testFindBooksByDateRangeEdgeCase() {
        LocalDate startDate = LocalDate.of(2021, 2, 3);
        LocalDate endDate = LocalDate.of(2021, 2, 3);
        when(bookRepository.findAll()).thenReturn(Arrays.asList(book1, book2));

        List<Book> result = bookService.findBooksByDateRange(startDate, endDate);
        assertEquals(1, result.size());
        assertTrue(result.contains(book1));
    }

    @Test
    void testUpdateReadingProgress() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book1));
        when(bookRepository.save(any(Book.class))).thenReturn(book1);

        Book updatedBook = bookService.updateReadingProgress(1L, Book.ReadingProgress.READING);

        assertEquals(Book.ReadingProgress.READING, updatedBook.getReadingProgress());
        verify(bookRepository).save(book1);
    }

    @Test
    void testUpdateReadingProgressBookNotFound() {
        when(bookRepository.findById(3L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            bookService.updateReadingProgress(3L, Book.ReadingProgress.READING);
        });
    }

    @Test
    void testSaveWithDefaultReadingProgress() {
        Book newBook = new Book(null, "new-title", "new-author", LocalDate.now());
        Book savedBook = new Book(3L, "new-title", "new-author", LocalDate.now());
        when(bookRepository.save(newBook)).thenReturn(savedBook);

        Book result = bookService.save(newBook);

        assertEquals(Book.ReadingProgress.WANT_TO_READ, result.getReadingProgress());
        verify(bookRepository).save(newBook);
    }

    @Test
    void testDeleteByIdAndUndoDelete() {
        Book book = new Book(1L, "title-1", "author-1", LocalDate.of(2021, 2, 3));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(bookRepository.save(book)).thenReturn(book);

        bookService.deleteById(1L);
        verify(bookRepository, times(1)).deleteById(1L);

        Book undeletedBook = bookService.undoDelete(1L);
        assertEquals(book, undeletedBook);
        verify(bookRepository, times(1)).save(book);
    }

    @Test
    void testUndoDeleteNonExistentBook() {
        assertThrows(RuntimeException.class, () -> {
            bookService.undoDelete(3L);
        });
    }

    @Test
    void testDeleteByIdAndUndoDeleteMultipleTimes() {
        Book book1 = new Book(1L, "title-1", "author-1", LocalDate.of(2021, 2, 3));
        Book book2 = new Book(2L, "title-2", "author-2", LocalDate.of(2022, 3, 4));

        when(bookRepository.findById(1L)).thenReturn(Optional.of(book1));
        when(bookRepository.findById(2L)).thenReturn(Optional.of(book2));
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookService.deleteById(1L);
        bookService.deleteById(2L);

        Book undeletedBook1 = bookService.undoDelete(1L);
        assertEquals(book1, undeletedBook1);

        Book undeletedBook2 = bookService.undoDelete(2L);
        assertEquals(book2, undeletedBook2);

        assertThrows(RuntimeException.class, () -> {
            bookService.undoDelete(1L);
        });
    }
}
