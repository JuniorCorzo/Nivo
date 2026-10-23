package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.domain.model.commons.valueobjects.AppProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@WebMvcTest(PublicConfigController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = PublicConfigController.class)
@ExtendWith(MockitoExtension.class)
class PublicConfigControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private AppProperties appProperties;

  @Test
  @DisplayName("GET /public/config - Should return accountCreationEnabled false when disabled")
  void shouldReturnDisabledConfig() throws Exception {
    when(appProperties.isAccountCreationEnabled()).thenReturn(false);

    mockMvc.perform(get("/public/config"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.accountCreationEnabled").value(false));
  }

  @Test
  @DisplayName("GET /public/config - Should return accountCreationEnabled true when enabled")
  void shouldReturnEnabledConfig() throws Exception {
    when(appProperties.isAccountCreationEnabled()).thenReturn(true);

    mockMvc.perform(get("/public/config"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.accountCreationEnabled").value(true));
  }
}
