package org.example.money_traker.repository;

import org.example.money_traker.model.Transaction;
import org.example.money_traker.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByType(TransactionType type);

    List<Transaction> findByDateBetween(LocalDate from, LocalDate to);

    List<Transaction> findByCategoryId(Long categoryId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    @Query("SELECT t.category.name, SUM(t.amount) FROM Transaction t WHERE t.type = 'EXPENSE' GROUP BY t.category.name")
    List<Object[]> sumExpensesByCategory();
}
