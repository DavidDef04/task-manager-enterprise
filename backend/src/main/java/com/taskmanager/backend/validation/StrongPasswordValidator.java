package com.taskmanager.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Rejects passwords that are too short, lack complexity, or appear on a list of
 * commonly used / breached passwords (e.g. "admin123", "password123").
 */
public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private static final int MIN_LENGTH = 10;

    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR = Pattern.compile("[^A-Za-z0-9]");

    // A small denylist of extremely common / breached passwords, checked in addition to
    // (not instead of) the complexity rules above, as defense in depth. Includes both
    // plain weak passwords and "complexity-satisfying but still predictable" patterns
    // (e.g. "Password123!") that character-class rules alone would otherwise accept.
    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "password1", "password123", "passw0rd", "12345678", "123456789",
            "1234567890", "qwerty123", "qwertyuiop", "admin123", "admin1234", "administrator",
            "letmein123", "welcome123", "welcome1", "iloveyou1", "monkey123", "dragon123",
            "master123", "football1", "baseball1", "sunshine1", "princess1", "abc123456",
            "superman1", "123123123", "changeme1", "trustno1", "michael123", "jennifer1",
            "password123!", "password1!", "welcome@123", "admin@1234", "qwerty@123",
            "p@ssw0rd123", "p@ssword1", "iloveyou@1", "changeme@1", "letmein@123"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // let @NotBlank report emptiness
        }

        String failureMessage = firstViolation(value);
        if (failureMessage == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(failureMessage).addConstraintViolation();
        return false;
    }

    private String firstViolation(String value) {
        if (value.length() < MIN_LENGTH) {
            return "Password must be at least " + MIN_LENGTH + " characters long";
        }
        if (!UPPERCASE.matcher(value).find()) {
            return "Password must contain at least one uppercase letter";
        }
        if (!LOWERCASE.matcher(value).find()) {
            return "Password must contain at least one lowercase letter";
        }
        if (!DIGIT.matcher(value).find()) {
            return "Password must contain at least one digit";
        }
        if (!SPECIAL_CHAR.matcher(value).find()) {
            return "Password must contain at least one special character";
        }
        if (COMMON_PASSWORDS.contains(value.toLowerCase())) {
            return "This password is too common, please choose a different one";
        }
        return null;
    }
}
