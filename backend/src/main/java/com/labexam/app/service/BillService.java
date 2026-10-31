package com.labexam.app.service;

import com.labexam.app.dto.BillItemRequest;
import com.labexam.app.dto.BillItemResponse;
import com.labexam.app.dto.BillRequest;
import com.labexam.app.dto.BillResponse;
import com.labexam.app.entity.Bill;
import com.labexam.app.entity.BillItem;
import com.labexam.app.entity.Product;
import com.labexam.app.exception.ResourceNotFoundException;
import com.labexam.app.repository.BillRepository;
import com.labexam.app.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillService {
    private static final BigDecimal DISCOUNT_LIMIT = new BigDecimal("1000");
    private static final BigDecimal DISCOUNT_RATE = new BigDecimal("10");

    private final ProductRepository productRepository;
    private final BillRepository billRepository;

    public BillService(ProductRepository productRepository, BillRepository billRepository) {
        this.productRepository = productRepository;
        this.billRepository = billRepository;
    }

    /** Price calculation only - nothing is stored. */
    public BillResponse calculate(BillRequest request) {
        String customerName = requireCustomerName(request);
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
        if (subtotal.compareTo(DISCOUNT_LIMIT) > 0) {
            discountPct = 10;
            discountAmount = subtotal.multiply(DISCOUNT_RATE).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }

        BigDecimal finalAmount = subtotal.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        discountAmount = discountAmount.setScale(2, RoundingMode.HALF_UP);

        return new BillResponse(null, customerName, trimPhone(request), items, subtotal, discountPct, discountAmount, finalAmount, Instant.now());
    }

    /** Calculates the bill and stores it together with its items. */
    @Transactional
    public BillResponse create(BillRequest request) {
        BillResponse calculated = calculate(request);

        Bill bill = new Bill();
        bill.setCustomerName(calculated.customerName());
        bill.setPhone(calculated.phone());
        bill.setSubtotal(calculated.subtotal());
        bill.setDiscountPercentage(calculated.discountPercentage());
        bill.setDiscountAmount(calculated.discountAmount());
        bill.setFinalAmount(calculated.finalAmount());
        bill.setBillDate(Instant.now());
        for (BillItemResponse item : calculated.items()) {
            bill.addItem(new BillItem(item.productName(), item.price(), item.quantity(), item.itemTotal()));
        }

        return toResponse(billRepository.save(bill));
    }

    @Transactional(readOnly = true)
    public List<BillResponse> list() {
        return billRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(BillService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BillResponse get(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found: " + id));
        return toResponse(bill);
    }

    private static String requireCustomerName(BillRequest request) {
        if (request.customerName() == null || request.customerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name required");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Select at least one product");
        }
        return request.customerName().trim();
    }

    private static String trimPhone(BillRequest request) {
        if (request.phone() == null || request.phone().trim().isEmpty()) {
            return null;
        }
        return request.phone().trim();
    }

    private static BillResponse toResponse(Bill bill) {
        List<BillItemResponse> items = bill.getItems().stream()
                .map(i -> new BillItemResponse(i.getProductName(), i.getPrice(), i.getQuantity(), i.getItemTotal()))
                .toList();
        return new BillResponse(bill.getId(), bill.getCustomerName(), bill.getPhone(), items,
                bill.getSubtotal(), bill.getDiscountPercentage(), bill.getDiscountAmount(),
                bill.getFinalAmount(), bill.getBillDate());
    }
}
