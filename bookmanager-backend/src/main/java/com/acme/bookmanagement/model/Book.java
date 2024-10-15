package com.acme.bookmanagement.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String title;
    private String author;
    private LocalDate publishedDate;

    @Enumerated(EnumType.STRING)
    private ReadingProgress readingProgress;

    // Add a default constructor
    public Book() {
        this.readingProgress = ReadingProgress.WANT_TO_READ;
    }

    public Book(Long id, String title, String author, LocalDate publishedDate) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.publishedDate = publishedDate;
        this.readingProgress = ReadingProgress.WANT_TO_READ;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public LocalDate getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(LocalDate publishedDate) {
        this.publishedDate = publishedDate;
    }

    public ReadingProgress getReadingProgress() {
        return readingProgress;
    }

    public void setReadingProgress(ReadingProgress readingProgress) {
        this.readingProgress = readingProgress;
    }

    public enum ReadingProgress {
        WANT_TO_READ,
        READING,
        COMPLETED
    }
}
