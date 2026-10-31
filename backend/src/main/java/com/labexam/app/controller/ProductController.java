package com.labexam.app.controller;

import com.labexam.app.dto.ApiResponse;
import com.labexam.app.dto.ProductDto;
import com.labexam.app.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<List<ProductDto>> all() {
        return ApiResponse.ok(productService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductDto> get(@PathVariable Long id) {
        var p = productService.getById(id);
        return ApiResponse.ok(new ProductDto(p.getId(), p.getProductName(), p.getPrice()));
    }

    @PostMapping
    public ApiResponse<ProductDto> add(@RequestBody ProductDto dto) {
        return ApiResponse.ok(productService.add(dto));
    }
}
