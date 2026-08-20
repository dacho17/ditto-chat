package com.ditto_chat.ditto_chat_server.utils;

import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class CryptoTool {
    private static CryptoTool cryptoToolSingletonRef;
    private static final String BCRYPT_HASH_REGEX = "^\\$2[abxy]?\\$[0-9]{2}\\$[./A-Za-z0-9]{53}$";
    private final BCryptPasswordEncoder passwordEncoder;

    private CryptoTool() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public static UUID generateUUID() {
        return UUID.randomUUID();
    }

    public static PasswordEncoder getPasswordEncoder() {
        if (CryptoTool.cryptoToolSingletonRef == null) {
            CryptoTool.cryptoToolSingletonRef = new CryptoTool();
        }

        return CryptoTool.cryptoToolSingletonRef.passwordEncoder;
    }

    public static String hashString(String plainText) {
        PasswordEncoder passwordEncoder = getPasswordEncoder();

        String hashedValue = passwordEncoder.encode(plainText);
        return hashedValue;
    }

    public static boolean isHashedWithBcrypt(String candidateValue) {
        if (candidateValue == null) {
            return false;
        }

        return candidateValue.matches(CryptoTool.BCRYPT_HASH_REGEX);
    }
}
