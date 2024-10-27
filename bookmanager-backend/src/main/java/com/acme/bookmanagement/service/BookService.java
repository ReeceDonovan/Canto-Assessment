package com.acme.bookmanagement.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.acme.bookmanagement.model.Book;
import com.acme.bookmanagement.repository.BookRepository;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final Map<Long, Book> recentlyDeletedBooks = new LinkedHashMap<Long, Book>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<Long, Book> eldest) {
            return size() > 10; // Keep only the 10 most recently deleted books
        }
    };

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    public Book save(Book book) {
        return bookRepository.save(book);
    }

    public Long deleteById(Long id) {
        Optional<Book> book = bookRepository.findById(id);
        if (book.isPresent()) {
            recentlyDeletedBooks.put(id, book.get());
            bookRepository.deleteById(id);
        }
        return id;
    }

    public List<Book> findBooksByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookRepository.findAll().stream()
                .filter(book -> !book.getPublishedDate().isBefore(startDate)
                        && !book.getPublishedDate().isAfter(endDate))
                .collect(Collectors.toList());
    }

    public Book updateReadingProgress(Long id, Book.ReadingProgress progress) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (optionalBook.isPresent()) {
            Book book = optionalBook.get();
            book.setReadingProgress(progress);
            return bookRepository.save(book);
        }
        throw new RuntimeException("Book not found with id: " + id);
    }

    public Book undoDelete(Long id) {
        Book book = recentlyDeletedBooks.remove(id);
        if (book != null) {
            return bookRepository.save(book);
        }
        throw new RuntimeException("Book not found in recently deleted items with id: " + id);
    }
}
