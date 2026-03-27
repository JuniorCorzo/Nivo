package dev.angelcorzo.nivo.jpa.mappers;

/**
 * Generic base interface for MapStruct mappers.
 *
 * <p>This interface defines the fundamental contract for converting between
 * a domain entity (E) and a JPA data entity (D).</p>
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Mapper)</p>
 * <p><strong>Responsibility:</strong> To provide a generic mapping contract.</p>
 *
 * @param <E> The Domain Entity type.
 * @param <D> The JPA Data Entity type.
 * @author Angel Corzo
 * @since 1.0.0
 */
public interface BaseMapper<E, D> {
     /**
      * Converts a JPA data entity to a domain entity.
      *
      * @param data The JPA data entity.
      * @return The corresponding domain entity.
      */
     E toEntity(D data);
     /**
      * Converts a domain entity to a JPA data entity.
      *
      * @param entity The domain entity.
      * @return The corresponding JPA data entity.
      */
     D toData(E entity);
}
