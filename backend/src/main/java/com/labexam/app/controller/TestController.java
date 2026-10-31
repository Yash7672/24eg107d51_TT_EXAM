package com.labexam.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {
    @GetMapping("/test")
    public Map<String,String> test() {
        Map<String,String> m = new HashMap<>();
        m.put("ok","yes");
        return m;
    }
}
