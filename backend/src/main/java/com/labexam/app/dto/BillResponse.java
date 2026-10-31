package com.labexam.app.dto;

import java.math.BigDecimal;
import java.util.List;

public record BillResponse(String customerName, List<BillItemResponse> items, BigDecimal subtotal, Integer discountPercentage, BigDecimal discountAmount, BigDecimal finalAmount) {
}
