package com.labexam.app.dto;

import java.math.BigDecimal;

public record DashboardResponse(long totalProducts,
                                long totalBills,
                                long todayBills,
                                BigDecimal totalRevenue) {
}
