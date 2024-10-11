package com.acme.bookmanagement.repository;

import com.acme.bookmanagement.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
}

