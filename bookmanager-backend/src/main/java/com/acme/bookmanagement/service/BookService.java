package com.acme.bookmanagement.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.acme.bookmanagement.model.Book;
import com.acme.bookmanagement.repository.BookRepository;

@Service
public class BookService {
    private final BookRepository bookRepository;

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
        bookRepository.deleteById(id);
        return id;
    }

    public List<Book> findBooksByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookRepository.findAll().stream()
                .filter(book -> !book.getPublishedDate().isBefore(startDate) && !book.getPublishedDate().isAfter(endDate))
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
}
