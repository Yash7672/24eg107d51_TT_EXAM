package com.labexam.app.dto;

import java.math.BigDecimal;

public record BillItemResponse(String productName, BigDecimal price, Integer quantity, BigDecimal itemTotal) {
}
