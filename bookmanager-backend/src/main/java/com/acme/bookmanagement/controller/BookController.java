package com.acme.bookmanagement.controller;

import com.acme.bookmanagement.model.Book;
import com.acme.bookmanagement.service.BookService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/graphql")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @QueryMapping
    public List<Book> findAllBooks() {
        return bookService.findAll();
    }

    @QueryMapping
    public Optional<Book> findBookById(@Argument Integer id) {
        return bookService.findById(Long.valueOf(id));
    }

    @MutationMapping
    public Book createBook(@Argument String title, @Argument String author, @Argument LocalDate publishedDate) {
        Book book = new Book(null, title, author, publishedDate);
        return bookService.save(book);
    }

    @MutationMapping
    public Long deleteBook(@Argument Long id) {
        return bookService.deleteById(id);
    }
}
