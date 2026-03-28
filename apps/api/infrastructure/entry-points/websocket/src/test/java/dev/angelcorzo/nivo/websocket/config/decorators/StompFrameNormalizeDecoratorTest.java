package dev.angelcorzo.nivo.websocket.config.decorators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;

class StompFrameNormalizeDecoratorTest {

  @Test
  void shouldKeepMessageWhenNoNormalizationIsNeeded() throws Exception {
    WebSocketHandler delegate = mock(WebSocketHandler.class);
    WebSocketSession session = mock(WebSocketSession.class);
    TextMessage original = new TextMessage("plain payload");

    StompFrameNormalizeDecorator decorator = new StompFrameNormalizeDecorator(delegate);
    decorator.handleMessage(session, original);

    verify(delegate).handleMessage(same(session), same(original));
  }

  @Test
  void shouldNormalizeEscapedNullVariants() throws Exception {
    WebSocketHandler delegate = mock(WebSocketHandler.class);
    WebSocketSession session = mock(WebSocketSession.class);
    TextMessage original = new TextMessage("SEND\n\nbody\\0\\u0000\\x00");

    StompFrameNormalizeDecorator decorator = new StompFrameNormalizeDecorator(delegate);
    decorator.handleMessage(session, original);

    ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
    verify(delegate).handleMessage(same(session), captor.capture());

    assertThat(captor.getValue()).isInstanceOf(TextMessage.class);
    assertThat(captor.getValue().getPayload()).isEqualTo("SEND\n\nbody\0\0\0");
  }

  @Test
  void shouldNormalizeDoubleEscapedNullTerminators() throws Exception {
    WebSocketHandler delegate = mock(WebSocketHandler.class);
    WebSocketSession session = mock(WebSocketSession.class);
    TextMessage original = new TextMessage("MESSAGE\\nsubscription:1\\n\\nhello\\\\u0000");

    StompFrameNormalizeDecorator decorator = new StompFrameNormalizeDecorator(delegate);
    decorator.handleMessage(session, original);

    ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
    verify(delegate).handleMessage(same(session), captor.capture());

    assertThat(captor.getValue().getPayload()).isEqualTo("MESSAGE\nsubscription:1\n\nhello\0");
  }

  @Test
  void shouldConvertEscapedNewLinesForEscapedStompFramesOnly() throws Exception {
    WebSocketHandler delegate = mock(WebSocketHandler.class);
    WebSocketSession session = mock(WebSocketSession.class);
    TextMessage original = new TextMessage("SEND\\r\\ncontent-type:text/plain\\n\\nbody\\0");

    StompFrameNormalizeDecorator decorator = new StompFrameNormalizeDecorator(delegate);
    decorator.handleMessage(session, original);

    ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
    verify(delegate).handleMessage(same(session), captor.capture());

    assertThat(captor.getValue().getPayload()).isEqualTo("SEND\ncontent-type:text/plain\n\nbody\0");
  }
}
