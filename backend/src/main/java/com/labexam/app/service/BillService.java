package com.labexam.app.service;

import com.labexam.app.dto.BillItemRequest;
import com.labexam.app.dto.BillItemResponse;
import com.labexam.app.dto.BillRequest;
import com.labexam.app.dto.BillResponse;
import com.labexam.app.entity.Product;
import com.labexam.app.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillService {
    private final ProductRepository productRepository;

    public BillService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public BillResponse calculate(BillRequest request) {
        if (request.customerName() == null || request.customerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name required");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Select at least one product");
        }

        List<BillItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (BillItemRequest it : request.items()) {
            if (it.productId() == null) {
                throw new IllegalArgumentException("Invalid product");
            }
            if (it.quantity() == null || it.quantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero");
            }
            Product p = productRepository.findById(it.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid product"));
            BigDecimal qty = BigDecimal.valueOf(it.quantity());
            BigDecimal itemTotal = p.getPrice().multiply(qty).setScale(2, RoundingMode.HALF_UP);
            items.add(new BillItemResponse(p.getProductName(), p.getPrice().setScale(2, RoundingMode.HALF_UP), it.quantity(), itemTotal));
            subtotal = subtotal.add(itemTotal);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        int discountPct = 0;
        if (subtotal.compareTo(new BigDecimal("1000")) > 0) {
            discountPct = 10;
            discountAmount = subtotal.multiply(new BigDecimal("10")).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }

        BigDecimal finalAmount = subtotal.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        discountAmount = discountAmount.setScale(2, RoundingMode.HALF_UP);

        return new BillResponse(request.customerName().trim(), items, subtotal, discountPct, discountAmount, finalAmount);
    }
}
