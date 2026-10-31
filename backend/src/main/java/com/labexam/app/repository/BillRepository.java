package com.labexam.app.repository;

import com.labexam.app.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;

public interface BillRepository extends JpaRepository<Bill, Long> {

    long countByBillDateGreaterThanEqual(Instant start);

    /** Null when no bill exists yet - the service turns that into zero. */
    @Query("select sum(b.finalAmount) from Bill b")
    BigDecimal sumRevenue();
}
