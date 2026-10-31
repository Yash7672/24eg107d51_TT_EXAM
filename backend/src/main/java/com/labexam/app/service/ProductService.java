package com.labexam.app.service;

import com.labexam.app.dto.ProductDto;
import com.labexam.app.entity.Product;
import com.labexam.app.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDto> getAll() {
        return productRepository.findAll().stream()
                .map(p -> new ProductDto(p.getId(), p.getProductName(), p.getPrice()))
                .collect(Collectors.toList());
    }

    public Product getById(Long id) {
        return productRepository.findById(id).orElseThrow();
    }

    public ProductDto add(ProductDto dto) {
        Product p = new Product(dto.productName(), dto.price());
        Product saved = productRepository.save(p);
        return new ProductDto(saved.getId(), saved.getProductName(), saved.getPrice());
    }

    public void seed() {
        if (productRepository.count() == 0) {
            productRepository.save(new Product("Rice", new BigDecimal("60")));
            productRepository.save(new Product("Sugar", new BigDecimal("45")));
            productRepository.save(new Product("Oil", new BigDecimal("150")));
            productRepository.save(new Product("Milk", new BigDecimal("30")));
            productRepository.save(new Product("Soap", new BigDecimal("40")));
            productRepository.save(new Product("Biscuits", new BigDecimal("20")));
            productRepository.save(new Product("Tea Powder", new BigDecimal("120")));
            productRepository.save(new Product("Detergent", new BigDecimal("90")));
        }
    }
}
