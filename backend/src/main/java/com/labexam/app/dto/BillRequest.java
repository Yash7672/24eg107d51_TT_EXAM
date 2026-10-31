package com.labexam.app.dto;

import java.util.List;

public record BillRequest(String customerName, List<BillItemRequest> items) {
}
