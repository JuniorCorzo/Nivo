package dev.angelcorzo.nivo.infrastructure.adapter.jpa.config;

import org.hibernate.boot.model.TypeContributions;
import org.hibernate.dialect.H2Dialect;
import org.hibernate.dialect.PostgreSQLDialect;
import org.hibernate.dialect.aggregate.AggregateSupport;
import org.hibernate.dialect.type.PostgreSQLStructCastingJdbcType;
import org.hibernate.service.ServiceRegistry;

public class TestH2Dialect extends H2Dialect {
  private final PostgreSQLDialect pgDialect = new PostgreSQLDialect();

  @Override
  public boolean supportsUserDefinedTypes() {
    return true;
  }

  @Override
  public boolean supportsIfExistsBeforeTypeName() {
    return true;
  }

  @Override
  public AggregateSupport getAggregateSupport() {
    return pgDialect.getAggregateSupport();
  }

  @Override
  public void contributeTypes(TypeContributions typeContributions, ServiceRegistry serviceRegistry) {
    super.contributeTypes(typeContributions, serviceRegistry);
    typeContributions.getTypeConfiguration()
        .getJdbcTypeRegistry()
        .addDescriptorIfAbsent(PostgreSQLStructCastingJdbcType.INSTANCE);
  }
}
