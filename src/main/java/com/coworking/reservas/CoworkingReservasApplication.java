package com.coworking.reservas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoworkingReservasApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoworkingReservasApplication.class, args);
    }
}
