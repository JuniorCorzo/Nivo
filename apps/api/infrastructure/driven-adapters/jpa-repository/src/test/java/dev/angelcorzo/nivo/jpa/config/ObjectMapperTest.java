package dev.angelcorzo.nivo.jpa.config;

import org.reactivecommons.utils.ObjectMapper;
import org.reactivecommons.utils.ObjectMapperImp;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class ObjectMapperTest {
    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapperImp();
    }
}
