package com.example.monpfebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.example.monpfebackend", "com.example.monpfebackend.Security"})
public class MonPfeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonPfeBackendApplication.class, args);
    }

}
