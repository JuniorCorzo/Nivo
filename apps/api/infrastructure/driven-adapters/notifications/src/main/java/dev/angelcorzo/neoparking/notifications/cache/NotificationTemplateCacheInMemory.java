package dev.angelcorzo.neoparking.notifications.cache;

import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.neoparking.model.notificationtemplates.gateways.NotificationTemplatesRepository;
import dev.angelcorzo.neoparking.notifications.valueobject.NotificationImmutableKey;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * In-memory, lazily-populated cache for {@link NotificationTemplates}.
 *
 * <p>Templates are loaded from the database on the first access for each
 * {@link NotificationImmutableKey} (event + channel combination) and kept in a
 * {@link ConcurrentHashMap} for the lifetime of the application. This avoids a DB round-trip on
 * every notification dispatch while still allowing templates to be configured at runtime before the
 * first event of each type is processed.
 *
 * <p><strong>Template-not-found behaviour:</strong> if no template exists in the database for a
 * given key, the cache logs an error and returns {@link Optional#empty()}. The
 * {@link dev.angelcorzo.neoparking.notifications.processors.NotificationProcessor} will simply skip
 * the delivery for that event, preventing a NullPointerException from propagating.
 *
 * <p><strong>Thread safety:</strong> {@link ConcurrentHashMap} guarantees safe concurrent reads.
 * The lazy-load on cache miss is not strictly atomic, but duplicate DB reads for the same key are
 * harmless and bounded to the first few concurrent requests.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Notifications)
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see NotificationTemplateCache
 * @see NotificationImmutableKey
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationTemplateCacheInMemory implements NotificationTemplateCache {

  private final NotificationTemplatesRepository templatesRepository;
  private final Map<NotificationImmutableKey, NotificationTemplates> notificationTemplates =
      new ConcurrentHashMap<>();

  /**
   * Returns the {@link NotificationTemplates} for the given key, loading it from the database if
   * it is not yet cached.
   *
   * <p>Returns {@link Optional#empty()} when no template is found in the database for the
   * requested {@code key}. Callers must treat an empty Optional as a no-op (skip delivery)
   * rather than an exceptional condition.
   *
   * @param key The immutable composite key (event + channel).
   * @return An {@link Optional} containing the template, or empty if not found.
   */
  @Override
  public Optional<NotificationTemplates> getTemplate(final NotificationImmutableKey key) {
    if (!this.notificationTemplates.containsKey(key)) {
      this.registerTemplate(key);
    }

    // Use ofNullable: registerTemplate logs and skips the put when the template is not found in
    // the database, so the map value may legitimately be null for unknown keys.
    return Optional.ofNullable(this.notificationTemplates.get(key));
  }

  /**
   * Loads the template for the given key from the database and stores it in the cache.
   *
   * <p>If no template is found, an error is logged and no entry is added to the map, so the next
   * call to {@link #getTemplate} will return {@link Optional#empty()} rather than throw.
   *
   * @param key The composite key to load.
   */
  private void registerTemplate(final NotificationImmutableKey key) {
    this.templatesRepository
        .findByEventTypeAndChannel(key.event(), key.channel())
        .ifPresentOrElse(
            template -> {
              this.notificationTemplates.put(key, template);
              log.info(
                  "Notification template registered in cache. eventType={}, channel={}, templateReference={}",
                  key.event(),
                  key.channel(),
                  template.getTemplateReference());
            },
            () ->
                log.error(
                    "Notification template not found in database — delivery will be skipped."
                        + " eventType={}, channel={}",
                    key.event(),
                    key.channel()));
  }
}
