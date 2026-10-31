package com.labexam.app.dto;

import java.math.BigDecimal;

public record ProductDto(Long id, String productName, BigDecimal price) {
}
