package com.labexam.app.controller;

import com.labexam.app.dto.ApiResponse;
import com.labexam.app.dto.BillRequest;
import com.labexam.app.dto.BillResponse;
import com.labexam.app.service.BillService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {
    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/calculate")
    public ApiResponse<BillResponse> calculate(@RequestBody BillRequest request) {
        return ApiResponse.ok(billService.calculate(request));
    }

    @PostMapping
    public ApiResponse<BillResponse> create(@RequestBody BillRequest request) {
        return ApiResponse.ok("Bill saved", billService.create(request));
    }

    @GetMapping
    public ApiResponse<List<BillResponse>> all() {
        return ApiResponse.ok(billService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<BillResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(billService.get(id));
    }
}
