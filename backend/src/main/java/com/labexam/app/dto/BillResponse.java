package com.labexam.app.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BillResponse(Long id,
                           String customerName,
                           String phone,
                           List<BillItemResponse> items,
                           BigDecimal subtotal,
                           Integer discountPercentage,
                           BigDecimal discountAmount,
                           BigDecimal finalAmount,
                           Instant billDate) {
}
