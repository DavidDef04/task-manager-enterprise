package com.taskmanager.backend.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class StrongPasswordValidatorTest {

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder violationBuilder;

    private StrongPasswordValidator validator;

    @BeforeEach
    void setUp() {
        validator = new StrongPasswordValidator();
        lenient().when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(violationBuilder);
    }

    @ParameterizedTest
    @ValueSource(strings = {"admin123", "david123", "password123", "Password1", "P@ss1", "short1A!"})
    void isValid_rejectsWeakOrTooShortPasswords(String password) {
        assertThat(validator.isValid(password, context)).isFalse();
    }

    @Test
    void isValid_rejectsCommonPasswords_evenWhenTheyMeetComplexityRules() {
        // Meets length/uppercase/lowercase/digit/special-char rules, but is a well-known
        // password pattern people use specifically to satisfy those rules.
        assertThat(validator.isValid("Password123!", context)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {"C0rrect#Horse9", "Tr0ub4dor&3xtra", "MyStr0ng!Passw0rd"})
    void isValid_acceptsPasswordsMeetingAllComplexityRules(String password) {
        assertThat(validator.isValid(password, context)).isTrue();
    }

    @Test
    void isValid_returnsTrue_forNullOrBlank_leavingThatToNotBlank() {
        assertThat(validator.isValid(null, context)).isTrue();
        assertThat(validator.isValid("", context)).isTrue();
    }
}
