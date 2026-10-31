package com.labexam.app.service;

import com.labexam.app.dto.DashboardResponse;
import com.labexam.app.repository.BillRepository;
import com.labexam.app.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
public class ReportService {
    private final ProductRepository productRepository;
    private final BillRepository billRepository;

    public ReportService(ProductRepository productRepository, BillRepository billRepository) {
        this.productRepository = productRepository;
        this.billRepository = billRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        // Bills are stored in UTC (hibernate.jdbc.time_zone=UTC), so "today" is UTC too.
        var todayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        BigDecimal revenue = billRepository.sumRevenue();

        return new DashboardResponse(
                productRepository.count(),
                billRepository.count(),
                billRepository.countByBillDateGreaterThanEqual(todayStart),
                revenue == null ? BigDecimal.ZERO : revenue);
    }
}
