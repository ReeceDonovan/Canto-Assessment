package com.acme.bookmanagement.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.GraphQlTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.graphql.test.tester.GraphQlTester;

import com.acme.bookmanagement.model.Book;
import com.acme.bookmanagement.service.BookService;

@GraphQlTest(BookController.class)
public class BookControllerTest {

        @Autowired
        private GraphQlTester graphQlTester;

        @MockBean
        private BookService bookService;

        private final Map<Long, Book> books = Map.of(
                        1L, new Book(1L,
                                        "title-1",
                                        "author-1",
                                        LocalDate.of(2021, 2, 3)),
                        2L, new Book(2L,
                                        "title-2",
                                        "author-2",
                                        LocalDate.of(2022, 3, 4)));

        @Test
        void shouldGetBookById() {
                when(this.bookService.findById(1L))
                                .thenReturn(Optional.ofNullable(books.get(1L)));

                this.graphQlTester
                                .documentName("findBookById")
                                .variable("id", 1)
                                .execute()
                                .path("findBookById")
                                .matchesJson("""
                                                {
                                                        "id": 1,
                                                        "title": "title-1",
                                                        "author": "author-1",
                                                        "publishedDate": "2021-02-03"
                                                }
                                                """);
        }

        @Test
        void shouldReturnNullWhenBookNotFound() {
                when(this.bookService.findById(3L))
                                .thenReturn(Optional.empty());

                this.graphQlTester
                                .documentName("findBookById")
                                .variable("id", 3)
                                .execute()
                                .path("findBookById")
                                .valueIsNull();
        }

        @Test
        void shouldGetAllBooks() {
                when(this.bookService.findAll())
                                .thenReturn(new ArrayList<>(books.values()));

                this.graphQlTester
                                .documentName("findAllBooks")
                                .execute()
                                .path("findAllBooks")
                                .entityList(Book.class)
                                .hasSize(2)
                                .satisfies(bookList -> {
                                        assertThat(bookList).extracting(Book::getId).containsExactlyInAnyOrder(1L, 2L);
                                        assertThat(bookList).extracting(Book::getTitle)
                                                        .containsExactlyInAnyOrder("title-1", "title-2");
                                });
        }

        @Test
        void shouldCreateBook() {
                String title = "new-title";
                String author = "new-author";
                LocalDate publishedDate = LocalDate.of(2023, 5, 1);
                Book newBook = new Book(3L, title, author, publishedDate);

                when(this.bookService.save(any(Book.class)))
                                .thenReturn(newBook);

                this.graphQlTester
                                .documentName("createBook")
                                .variable("title", title)
                                .variable("author", author)
                                .variable("publishedDate", publishedDate.toString())
                                .execute()
                                .path("createBook")
                                .entity(Book.class)
                                .satisfies(book -> {
                                        assertThat(book.getId()).isEqualTo(3L);
                                        assertThat(book.getTitle()).isEqualTo(title);
                                        assertThat(book.getAuthor()).isEqualTo(author);
                                        assertThat(book.getPublishedDate()).isEqualTo(publishedDate);
                                });
        }

        @Test
        void shouldDeleteBook() {
                when(this.bookService.deleteById(1L))
                                .thenReturn(1L);

                this.graphQlTester
                                .documentName("deleteBook")
                                .variable("id", 1)
                                .execute()
                                .path("deleteBook")
                                .entity(Integer.class)
                                .isEqualTo(1);
        }

        @Test
        void shouldFindBooksByDate() {
                LocalDate startDate = LocalDate.of(2021, 1, 1);
                LocalDate endDate = LocalDate.of(2022, 12, 31);
                List<Book> filteredBooks = new ArrayList<>(books.values());

                when(this.bookService.findBooksByDateRange(startDate, endDate))
                                .thenReturn(filteredBooks);

                this.graphQlTester
                                .documentName("findBooksByDate")
                                .variable("startDate", startDate.toString())
                                .variable("endDate", endDate.toString())
                                .execute()
                                .path("findBooksByDate")
                                .entityList(Book.class)
                                .hasSize(2)
                                .satisfies(bookList -> assertThat(bookList)
                                                .allMatch(book -> !book.getPublishedDate().isBefore(startDate)
                                                                && !book.getPublishedDate().isAfter(endDate)));
        }

        @Test
        void shouldFindBooksByDateWithoutEndDate() {
                LocalDate startDate = LocalDate.of(2021, 1, 1);
                List<Book> filteredBooks = new ArrayList<>(books.values());

                when(this.bookService.findBooksByDateRange(eq(startDate), any(LocalDate.class)))
                                .thenReturn(filteredBooks);

                this.graphQlTester
                                .documentName("findBooksByDate")
                                .variable("startDate", startDate.toString())
                                .execute()
                                .path("findBooksByDate")
                                .entityList(Book.class)
                                .hasSize(2)
                                .satisfies(bookList -> assertThat(bookList)
                                                .allMatch(book -> !book.getPublishedDate().isBefore(startDate)));
        }

        @Test
        void shouldReturnEmptyListWhenNoBooksFoundInDateRange() {
                LocalDate startDate = LocalDate.of(2023, 1, 1);
                LocalDate endDate = LocalDate.of(2023, 12, 31);

                when(this.bookService.findBooksByDateRange(startDate, endDate))
                                .thenReturn(new ArrayList<>());

                this.graphQlTester
                                .documentName("findBooksByDate")
                                .variable("startDate", startDate.toString())
                                .variable("endDate", endDate.toString())
                                .execute()
                                .path("findBooksByDate")
                                .entityList(Book.class)
                                .hasSize(0);
        }

        @Test
        void shouldUpdateBookProgress() {
                Book updatedBook = new Book(1L, "title-1", "author-1", LocalDate.of(2021, 2, 3));
                updatedBook.setReadingProgress(Book.ReadingProgress.READING);

                when(this.bookService.updateReadingProgress(1L, Book.ReadingProgress.READING))
                                .thenReturn(updatedBook);

                this.graphQlTester
                                .documentName("updateBookProgress")
                                .variable("id", 1)
                                .variable("progress", "READING")
                                .execute()
                                .path("updateBookProgress")
                                .entity(Book.class)
                                .satisfies(book -> {
                                        assertThat(book.getId()).isEqualTo(1L);
                                        assertThat(book.getReadingProgress()).isEqualTo(Book.ReadingProgress.READING);
                                });
        }

        @Test
        void shouldCreateBookWithDefaultReadingProgress() {
                String title = "new-title";
                String author = "new-author";
                LocalDate publishedDate = LocalDate.of(2023, 5, 1);
                Book newBook = new Book(3L, title, author, publishedDate);
                newBook.setReadingProgress(Book.ReadingProgress.WANT_TO_READ);

                when(this.bookService.save(any(Book.class)))
                                .thenReturn(newBook);

                this.graphQlTester
                                .documentName("createBook")
                                .variable("title", title)
                                .variable("author", author)
                                .variable("publishedDate", publishedDate.toString())
                                .execute()
                                .path("createBook")
                                .entity(Book.class)
                                .satisfies(book -> {
                                        assertThat(book.getId()).isEqualTo(3L);
                                        assertThat(book.getTitle()).isEqualTo(title);
                                        assertThat(book.getAuthor()).isEqualTo(author);
                                        assertThat(book.getPublishedDate()).isEqualTo(publishedDate);
                                        assertThat(book.getReadingProgress())
                                                        .isEqualTo(Book.ReadingProgress.WANT_TO_READ);
                                });
        }

        @Test
        void shouldUndoDeleteBook() {
                Book undeletedBook = new Book(1L, "title-1", "author-1", LocalDate.of(2021, 2, 3));
                undeletedBook.setReadingProgress(Book.ReadingProgress.WANT_TO_READ);

                when(this.bookService.undoDelete(1L))
                                .thenReturn(undeletedBook);

                this.graphQlTester
                                .documentName("undoDeleteBook")
                                .variable("id", 1)
                                .execute()
                                .path("undoDeleteBook")
                                .entity(Book.class)
                                .satisfies(book -> {
                                        assertThat(book.getId()).isEqualTo(1L);
                                        assertThat(book.getTitle()).isEqualTo("title-1");
                                        assertThat(book.getAuthor()).isEqualTo("author-1");
                                        assertThat(book.getPublishedDate()).isEqualTo(LocalDate.of(2021, 2, 3));
                                        assertThat(book.getReadingProgress())
                                                        .isEqualTo(Book.ReadingProgress.WANT_TO_READ);
                                });
        }
}
