package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.TaskRequest;
import com.taskmanager.backend.dto.TaskResponse;
import com.taskmanager.backend.entity.Task;
import com.taskmanager.backend.entity.TaskStatus;
import com.taskmanager.backend.entity.User;
import com.taskmanager.backend.exception.ResourceNotFoundException;
import com.taskmanager.backend.mapper.TaskMapper;
import com.taskmanager.backend.repository.TaskRepository;
import com.taskmanager.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private final TaskMapper taskMapper = new TaskMapper();

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = User.builder().id(1L).username("johndoe").email("john@example.com").password("hashed").build();
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(currentUser.getEmail(), null));

        taskService = new TaskService(taskRepository, userRepository, taskMapper);
        when(userRepository.findByEmail(currentUser.getEmail())).thenReturn(Optional.of(currentUser));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createTask_persistsTaskOwnedByCurrentUser() {
        TaskRequest request = new TaskRequest("Write report", "Quarterly report", TaskStatus.TODO);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(10L);
            task.setCreatedAt(Instant.now());
            task.setUpdatedAt(Instant.now());
            return task;
        });

        TaskResponse response = taskService.createTask(request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getTitle()).isEqualTo("Write report");
        assertThat(response.getStatus()).isEqualTo(TaskStatus.TODO);
    }

    @Test
    void createTask_defaultsStatusToTodo_whenStatusNotProvided() {
        TaskRequest request = new TaskRequest("Untitled status task", null, null);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.createTask(request);

        assertThat(response.getStatus()).isEqualTo(TaskStatus.TODO);
    }

    @Test
    void updateTask_throwsResourceNotFoundException_whenTaskDoesNotBelongToCurrentUser() {
        when(taskRepository.findByIdAndUserId(99L, currentUser.getId())).thenReturn(Optional.empty());
        TaskRequest request = new TaskRequest("Updated title", "Updated desc", TaskStatus.DONE);

        assertThatThrownBy(() -> taskService.updateTask(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(taskRepository, never()).save(any());
    }

    @Test
    void deleteTask_throwsResourceNotFoundException_whenTaskIdIsInvalid() {
        when(taskRepository.findByIdAndUserId(404L, currentUser.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(404L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(taskRepository, never()).delete(any());
    }

    @Test
    void getTasks_filtersByStatusAndSearch_whenBothProvided() {
        Task task = Task.builder().id(1L).title("Fix bug").status(TaskStatus.IN_PROGRESS).user(currentUser).build();
        when(taskRepository.findByUserIdAndStatusAndTitleContainingIgnoreCase(
                eq(currentUser.getId()), eq(TaskStatus.IN_PROGRESS), eq("bug")))
                .thenReturn(List.of(task));

        List<TaskResponse> result = taskService.getTasks(TaskStatus.IN_PROGRESS, "bug");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Fix bug");
    }
}
