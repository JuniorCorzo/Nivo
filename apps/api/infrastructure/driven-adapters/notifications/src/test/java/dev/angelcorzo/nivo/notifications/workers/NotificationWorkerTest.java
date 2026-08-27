package dev.angelcorzo.nivo.notifications.workers;

import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.notifications.processors.NotificationProcessor;
import dev.angelcorzo.nivo.notifications.queues.SendNotificationQueue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationWorker Unit Tests")
class NotificationWorkerTest {

  @Mock private SendNotificationQueue queue;
  @Mock private NotificationProcessor notificationProcessor;

  @InjectMocks private NotificationWorker worker;

  @Test
  @DisplayName("Should start application and handle loop without exception")
  void shouldStartApplication() throws Exception {
    lenient().when(queue.take()).thenThrow(new InterruptedException());

    worker.onStartApplication();
    Thread.sleep(100);
  }
}
