package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.ChangePasswordRequest;
import com.taskmanager.backend.dto.UpdateProfileRequest;
import com.taskmanager.backend.dto.UserResponse;
import com.taskmanager.backend.entity.User;
import com.taskmanager.backend.exception.DuplicateResourceException;
import com.taskmanager.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = User.builder().id(1L).username("johndoe").email("john@example.com").password("hashed").build();
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(currentUser.getEmail(), null));
        when(userRepository.findByEmail(currentUser.getEmail())).thenReturn(Optional.of(currentUser));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateProfile_updatesUsernameAndEmail_whenBothAreAvailable() {
        UpdateProfileRequest request = new UpdateProfileRequest("newname", "new@example.com");
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("newname")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateProfile(request);

        assertThat(response.getUsername()).isEqualTo("newname");
        assertThat(response.getEmail()).isEqualTo("new@example.com");
    }

    @Test
    void updateProfile_allowsKeepingTheSameEmailAndUsername() {
        UpdateProfileRequest request = new UpdateProfileRequest("johndoe", "john@example.com");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateProfile(request);

        assertThat(response.getUsername()).isEqualTo("johndoe");
        verify(userRepository, never()).existsByEmail(any());
        verify(userRepository, never()).existsByUsername(any());
    }

    @Test
    void updateProfile_throwsDuplicateResourceException_whenEmailTakenByAnotherUser() {
        UpdateProfileRequest request = new UpdateProfileRequest("johndoe", "taken@example.com");
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateProfile(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_updatesHash_whenCurrentPasswordMatches() {
        ChangePasswordRequest request = new ChangePasswordRequest("oldPassword1", "newPassword1");
        when(passwordEncoder.matches("oldPassword1", "hashed")).thenReturn(true);
        when(passwordEncoder.encode("newPassword1")).thenReturn("new-hashed");

        userService.changePassword(request);

        assertThat(currentUser.getPassword()).isEqualTo("new-hashed");
        verify(userRepository).save(currentUser);
    }

    @Test
    void changePassword_throwsBadCredentialsException_whenCurrentPasswordIsWrong() {
        ChangePasswordRequest request = new ChangePasswordRequest("wrongPassword", "newPassword1");
        when(passwordEncoder.matches("wrongPassword", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword(request))
                .isInstanceOf(BadCredentialsException.class);

        verify(userRepository, never()).save(any());
    }
}
