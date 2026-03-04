package org.example.money_traker.service;

import lombok.RequiredArgsConstructor;
import org.example.money_traker.dto.CategoryResponse;
import org.example.money_traker.dto.SummaryResponse;
import org.example.money_traker.dto.TransactionRequest;
import org.example.money_traker.dto.TransactionResponse;
import org.example.money_traker.exception.ResourceNotFoundException;
import org.example.money_traker.model.Category;
import org.example.money_traker.model.Transaction;
import org.example.money_traker.model.TransactionType;
import org.example.money_traker.repository.CategoryRepository;
import org.example.money_traker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public List<TransactionResponse> getAllTransactions(TransactionType type, LocalDate from, LocalDate to) {
        List<Transaction> transactions;

        if (type != null && from != null && to != null) {
            transactions = transactionRepository.findByType(type).stream()
                    .filter(t -> !t.getDate().isBefore(from) && !t.getDate().isAfter(to))
                    .collect(Collectors.toList());
        } else if (type != null) {
            transactions = transactionRepository.findByType(type);
        } else if (from != null && to != null) {
            transactions = transactionRepository.findByDateBetween(from, to);
        } else {
            transactions = transactionRepository.findAll();
        }

        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .description(request.getDescription())
                .date(request.getDate())
                .category(category)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate());
        transaction.setCategory(category);

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        transactionRepository.delete(transaction);
    }

    public SummaryResponse getSummary() {
        BigDecimal totalIncome = transactionRepository.sumByType(TransactionType.INCOME);
        BigDecimal totalExpenses = transactionRepository.sumByType(TransactionType.EXPENSE);
        BigDecimal balance = totalIncome.subtract(totalExpenses);

        Map<String, BigDecimal> spendingByCategory = new LinkedHashMap<>();
        List<Object[]> expensesByCategory = transactionRepository.sumExpensesByCategory();
        for (Object[] row : expensesByCategory) {
            spendingByCategory.put((String) row[0], (BigDecimal) row[1]);
        }

        return SummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .balance(balance)
                .spendingByCategory(spendingByCategory)
                .build();
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .date(transaction.getDate())
                .category(CategoryResponse.builder()
                        .id(transaction.getCategory().getId())
                        .name(transaction.getCategory().getName())
                        .type(transaction.getCategory().getType())
                        .build())
                .build();
    }
}
