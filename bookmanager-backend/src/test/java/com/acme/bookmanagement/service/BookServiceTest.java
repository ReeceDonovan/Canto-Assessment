package com.acme.bookmanagement.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

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
        bookService.deleteById(1L);
        verify(bookRepository, times(1)).deleteById(1L);
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
}
