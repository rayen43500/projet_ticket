package com.example.monpfebackend.dto;

import com.example.monpfebackend.Entity.Utilisateur;

public class AuthResponseDto {
    private Utilisateur utilisateur;
    private String token;
    private String refreshToken;
    private long expiresIn;

    public AuthResponseDto() {
    }

    public AuthResponseDto(Utilisateur utilisateur, String token, String refreshToken, long expiresIn) {
        this.utilisateur = utilisateur;
        this.token = token;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
} 