package com.taskmanager.backend.controller;

import com.taskmanager.backend.dto.ChangePasswordRequest;
import com.taskmanager.backend.dto.RegisterRequest;
import com.taskmanager.backend.dto.UpdateProfileRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String username, String email) throws Exception {
        RegisterRequest request = new RegisterRequest(username, email, "securePass1");
        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(body);
        return json.get("token").asText();
    }

    @Test
    void getCurrentUser_returnsProfile_whenAuthenticated() throws Exception {
        String token = registerAndGetToken("laura", "laura@example.com");

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("laura"))
                .andExpect(jsonPath("$.email").value("laura@example.com"));
    }

    @Test
    void getCurrentUser_returns401_whenNoTokenProvided() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProfile_returns200_whenUsernameAndEmailAreAvailable() throws Exception {
        String token = registerAndGetToken("marc", "marc@example.com");
        UpdateProfileRequest update = new UpdateProfileRequest("marc.updated", "marc.updated@example.com");

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("marc.updated"))
                .andExpect(jsonPath("$.email").value("marc.updated@example.com"));
    }

    @Test
    void updateProfile_returns409_whenEmailAlreadyUsedByAnotherAccount() throws Exception {
        registerAndGetToken("nina", "nina@example.com");
        String token = registerAndGetToken("oscar", "oscar@example.com");

        UpdateProfileRequest update = new UpdateProfileRequest("oscar", "nina@example.com");

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isConflict());
    }

    @Test
    void changePassword_returns204_whenCurrentPasswordIsCorrect() throws Exception {
        String token = registerAndGetToken("paula", "paula@example.com");
        ChangePasswordRequest request = new ChangePasswordRequest("securePass1", "newSecurePass1");

        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    void changePassword_returns401_whenCurrentPasswordIsWrong() throws Exception {
        String token = registerAndGetToken("quentin", "quentin@example.com");
        ChangePasswordRequest request = new ChangePasswordRequest("wrongCurrentPass", "newSecurePass1");

        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
