package dev.angelcorzo.neoparking.jpa.config;

import java.util.Collection;
import org.hibernate.Hibernate;
import org.mapstruct.Condition;
import org.mapstruct.Named;

public class LazyMappingConfig {
  @Condition
  @Named("isHibernateLoaded")
  public static <T> boolean isLoaded(Collection<T> collection) {
    return collection != null && Hibernate.isInitialized(collection);
  }

  @Condition
  @Named("isHibernateLoaded")
  public static <T> boolean isLoaded(Object obj) {
    return obj != null && Hibernate.isInitialized(obj);
  }
}
