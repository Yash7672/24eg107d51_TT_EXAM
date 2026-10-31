package com.labexam.app.controller;

import com.labexam.app.dto.ApiResponse;
import com.labexam.app.dto.BillRequest;
import com.labexam.app.dto.BillResponse;
import com.labexam.app.service.BillService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
