package com.labexam.app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testProductsLoadedAndPricesMatch() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(8)))
                .andExpect(jsonPath("$.data[0].productName").value("Rice"))
                .andExpect(jsonPath("$.data[0].price").value(60.00))
                .andExpect(jsonPath("$.data[1].productName").value("Sugar"))
                .andExpect(jsonPath("$.data[1].price").value(45.00))
                .andExpect(jsonPath("$.data[2].productName").value("Oil"))
                .andExpect(jsonPath("$.data[2].price").value(150.00));
    }

    @Test
    void testBillCalculationWithoutDiscount() throws Exception {
        // Rice: 60 * 5 = 300 (<= 1000, 0% discount)
        String payload = """
                {
                    "customerName": "Ramesh",
                    "items": [
                        { "productId": 1, "quantity": 5 }
                    ]
                }
                """;

        mockMvc.perform(post("/api/bills/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.subtotal").value(300.00))
                .andExpect(jsonPath("$.data.discountPercentage").value(0))
                .andExpect(jsonPath("$.data.discountAmount").value(0.00))
                .andExpect(jsonPath("$.data.finalAmount").value(300.00));
    }

    @Test
    void testBillCalculationWithTenPercentDiscountAbove1000() throws Exception {
        // Tea Powder: 120 * 10 = 1200 (> 1000, 10% discount = 120, final = 1080)
        String payload = """
                {
                    "customerName": "Suresh",
                    "phone": "9876543210",
                    "items": [
                        { "productId": 7, "quantity": 10 }
                    ]
                }
                """;

        mockMvc.perform(post("/api/bills/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.subtotal").value(1200.00))
                .andExpect(jsonPath("$.data.discountPercentage").value(10))
                .andExpect(jsonPath("$.data.discountAmount").value(120.00))
                .andExpect(jsonPath("$.data.finalAmount").value(1080.00));
    }

    @Test
    void testCreateBillAndFetch() throws Exception {
        String payload = """
                {
                    "customerName": "Anil",
                    "phone": "9123456780",
                    "items": [
                        { "productId": 3, "quantity": 10 }
                    ]
                }
                """;

        mockMvc.perform(post("/api/bills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customerName").value("Anil"))
                .andExpect(jsonPath("$.data.subtotal").value(1500.00))
                .andExpect(jsonPath("$.data.discountPercentage").value(10))
                .andExpect(jsonPath("$.data.discountAmount").value(150.00))
                .andExpect(jsonPath("$.data.finalAmount").value(1350.00));

        mockMvc.perform(get("/api/bills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].customerName").value("Anil"));
    }
}
