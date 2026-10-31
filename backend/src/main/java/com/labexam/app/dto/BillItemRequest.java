package com.labexam.app.dto;

import java.math.BigDecimal;

public record BillItemRequest(Long productId, Integer quantity) {
}
