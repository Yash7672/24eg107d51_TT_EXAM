package com.labexam.app.dto;

import java.util.List;

public record BillRequest(String customerName, String phone, List<BillItemRequest> items) {
}
