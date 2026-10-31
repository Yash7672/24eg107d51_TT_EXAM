package com.labexam.app.config;

import com.labexam.app.service.ProductService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeed {
    @Bean
    CommandLineRunner seed(ProductService productService) {
        return args -> productService.seed();
    }
}
