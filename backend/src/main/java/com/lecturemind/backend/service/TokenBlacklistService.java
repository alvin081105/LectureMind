package com.lecturemind.backend.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    public void blacklist(String token, long expirationMs) {
        blacklist.put(token, System.currentTimeMillis() + expirationMs);
    }

    public boolean isBlacklisted(String token) {
        Long expiry = blacklist.get(token);
        if (expiry == null) return false;
        if (System.currentTimeMillis() > expiry) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }
}
