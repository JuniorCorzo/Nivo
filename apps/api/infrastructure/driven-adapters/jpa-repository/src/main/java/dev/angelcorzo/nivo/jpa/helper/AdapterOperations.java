package dev.angelcorzo.nivo.jpa.helper;

import static java.util.stream.StreamSupport.stream;

import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.QueryByExampleExecutor;
import org.springframework.transaction.annotation.Transactional;

/**
 * Abstract base class for JPA adapter operations.
 *
 * <p>This class provides common CRUD and mapping functionalities for JPA repositories, acting as a
 * helper for driven adapters in the Infrastructure layer.
 *
 * <p>It handles the conversion between domain entities (E) and JPA data entities (D).
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter Helper)
 *
 * <p><strong>Responsibility:</strong> To provide generic persistence operations and entity-to-data
 * mapping.
 *
 * @param <E> The Domain Entity type.
 * @param <D> The JPA Data Entity type.
 * @param <I> The ID type of the JPA Data Entity.
 * @param <R> The JPA Repository type, extending CrudRepository and QueryByExampleExecutor.
 * @author Angel Corzo
 * @since 1.0.0
 * @see BaseMapper
 */
public abstract class AdapterOperations<
    E, D, I, R extends JpaRepository<D, I> & QueryByExampleExecutor<D>> {
  private final Class<D> dataClass;
  protected R repository;
  protected BaseMapper<E, D> mapper;

  /**
   * Constructor for AdapterOperations.
   *
   * @param repository The JPA repository instance.
   * @param mapper The mapper for converting between domain and data entities.
   */
  @SuppressWarnings("unchecked")
  protected AdapterOperations(R repository, BaseMapper<E, D> mapper) {
    this.repository = repository;
    this.mapper = mapper;
    ParameterizedType genericSuperclass =
        (ParameterizedType) this.getClass().getGenericSuperclass();
    this.dataClass = (Class<D>) genericSuperclass.getActualTypeArguments()[1];
  }

  /**
   * Converts a domain entity to a JPA data entity.
   *
   * @param entity The domain entity.
   * @return The corresponding JPA data entity.
   */
  protected D toData(E entity) {
    return mapper.toData(entity);
  }

  /**
   * Converts a JPA data entity to a domain entity.
   *
   * @param data The JPA data entity.
   * @return The corresponding domain entity, or null if the data entity is null.
   */
  protected E toEntity(D data) {
    return data != null ? mapper.toEntity(data) : null;
  }

  /**
   * Saves a domain entity to the database.
   *
   * @param entity The domain entity to save.
   * @return The saved domain entity.
   */
  @Transactional
  public E save(E entity) {
    D data = toData(entity);
    return toEntity(saveData(data));
  }

  /**
   * Saves a list of domain entities to the database.
   *
   * @param entities The list of domain entities to save.
   * @return A list of the saved domain entities.
   */
  protected List<E> saveAllEntities(List<E> entities) {
    List<D> list = entities.stream().map(this::toData).toList();
    return toList(saveData(list));
  }

  /**
   * Converts an iterable of JPA data entities to a list of domain entities.
   *
   * @param iterable An iterable of JPA data entities.
   * @return A list of domain entities.
   */
  public List<E> toList(Iterable<D> iterable) {
    return stream(iterable.spliterator(), false).map(this::toEntity).toList();
  }

  /**
   * Saves a single JPA data entity to the database.
   *
   * @param data The JPA data entity to save.
   * @return The saved JPA data entity.
   */
  protected D saveData(D data) {
    return repository.saveAndFlush(data);
  }

  /**
   * Saves a list of JPA data entities to the database.
   *
   * @param data The list of JPA data entities to save.
   * @return An iterable of the saved JPA data entities.
   */
  protected Iterable<D> saveData(List<D> data) {
    return repository.saveAll(data);
  }

  /**
   * Finds a domain entity by its ID.
   *
   * @param id The ID of the entity to find.
   * @return An {@link Optional} containing the found domain entity, or empty if not found.
   */
  @Transactional(readOnly = true)
  public Optional<E> findById(I id) {
    return this.repository.findById(id).map(this::toEntity);
  }

  /**
   * Finds domain entities by example.
   *
   * @param entity The domain entity example to use for the search.
   * @return A list of domain entities matching the example.
   */
  @Transactional(readOnly = true)
  public List<E> findByExample(E entity) {
    return toList(repository.findAll(Example.of(toData(entity))));
  }

  /**
   * Finds all domain entities.
   *
   * @return A list of all domain entities.
   */
  @Transactional(readOnly = true)
  public List<E> findAll() {
    return toList(repository.findAll());
  }
}
