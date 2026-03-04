package org.example.money_traker.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.money_traker.model.Category;
import org.example.money_traker.model.Transaction;
import org.example.money_traker.model.TransactionType;
import org.example.money_traker.repository.CategoryRepository;
import org.example.money_traker.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public void run(String... args) {
        log.info("Initializing default data...");

        // Expense categories
        Category food = categoryRepository.save(Category.builder().name("Food").type(TransactionType.EXPENSE).build());
        Category transport = categoryRepository.save(Category.builder().name("Transport").type(TransactionType.EXPENSE).build());
        Category entertainment = categoryRepository.save(Category.builder().name("Entertainment").type(TransactionType.EXPENSE).build());
        Category shopping = categoryRepository.save(Category.builder().name("Shopping").type(TransactionType.EXPENSE).build());
        Category bills = categoryRepository.save(Category.builder().name("Bills").type(TransactionType.EXPENSE).build());

        // Income categories
        Category salary = categoryRepository.save(Category.builder().name("Salary").type(TransactionType.INCOME).build());
        Category freelance = categoryRepository.save(Category.builder().name("Freelance").type(TransactionType.INCOME).build());
        Category investment = categoryRepository.save(Category.builder().name("Investment").type(TransactionType.INCOME).build());

        // Sample transactions
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("150000.00"))
                .type(TransactionType.INCOME)
                .category(salary)
                .description("Monthly salary")
                .date(LocalDate.of(2026, 3, 1))
                .build());

        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("25000.00"))
                .type(TransactionType.INCOME)
                .category(freelance)
                .description("Web development project")
                .date(LocalDate.of(2026, 3, 2))
                .build());

        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("3500.00"))
                .type(TransactionType.EXPENSE)
                .category(food)
                .description("Grocery shopping")
                .date(LocalDate.of(2026, 3, 1))
                .build());

        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("1200.00"))
                .type(TransactionType.EXPENSE)
                .category(transport)
                .description("Metro pass")
                .date(LocalDate.of(2026, 3, 1))
                .build());

        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("2000.00"))
                .type(TransactionType.EXPENSE)
                .category(entertainment)
                .description("Cinema and dinner")
                .date(LocalDate.of(2026, 3, 2))
                .build());

        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("15000.00"))
                .type(TransactionType.EXPENSE)
                .category(bills)
                .description("Rent payment")
                .date(LocalDate.of(2026, 3, 1))
                .build());

        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("5000.00"))
                .type(TransactionType.EXPENSE)
                .category(shopping)
                .description("New headphones")
                .date(LocalDate.of(2026, 3, 3))
                .build());

        log.info("Default data initialized: {} categories, {} transactions",
                categoryRepository.count(), transactionRepository.count());
    }
}
