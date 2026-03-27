package dev.angelcorzo.nivo.model.commons.result;

import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Represents the result of an operation that can be either successful or failed. This is a sealed
 * interface that only allows two implementations: {@link Success} and {@link Failure}.
 *
 * @param <T> The type of the success value.
 * @param <E> The type of the error, which must extend {@link DomainError}.
 */
public sealed interface Result<T, E extends DomainError> permits Result.Success, Result.Failure {
  /**
   * Creates a successful result containing a value.
   *
   * @param value The success value.
   * @param <T> The type of the success value.
   * @param <E> The type of the error.
   * @return A {@link Success} instance containing the value.
   */
  static <T, E extends DomainError> Result<T, E> success(T value) {
    return new Success<>(value);
  }

  /**
   * Creates a failed result containing an error.
   *
   * @param failure The domain error.
   * @param <T> The type of the success value.
   * @param <E> The type of the error.
   * @return A {@link Failure} instance containing the error.
   */
  static <T, E extends DomainError> Result<T, E> failure(E failure) {
    return new Failure<>(failure);
  }

  /**
   * Indicates whether the result is successful.
   *
   * @return {@code true} if it is {@link Success}, {@code false} otherwise.
   */
  default boolean isSuccess() {
    return this instanceof Success;
  }

  /**
   * Indicates whether the result is a failure.
   *
   * @return {@code true} if it is {@link Failure}, {@code false} otherwise.
   */
  default boolean isFailure() {
    return this instanceof Failure;
  }

  /**
   * Gets the success value if present.
   *
   * @return The success value.
   * @throws IllegalStateException If the result is an error.
   */
  default T get() {
    return switch (this) {
      case Success<T, E> success -> success.value();
      case Failure<T, E> failure -> throw new IllegalStateException(failure.failure().message());
    };
  }

  /**
   * Gets the error if present.
   *
   * @return The domain error.
   * @throws IllegalStateException If the result is successful.
   */
  default E getError() {
    return switch (this) {
      case Success<T, E> success ->
          throw new IllegalStateException("Success result does not have an error");
      case Failure<T, E> failure -> failure.failure();
    };
  }

  /**
   * Transforms the success value by applying the provided function if the result is successful. If
   * the result is an error, the same error is returned.
   *
   * @param mapper Transformation function.
   * @param <U> The new type of the success value.
   * @return A new {@link Result} with the transformed value or the original error.
   */
  default <U> Result<U, E> map(Function<? super T, ? extends U> mapper) {
    return switch (this) {
      case Success<T, E> success -> Result.success(mapper.apply(success.value()));
      case Failure<T, E> failure -> Result.failure(failure.failure());
    };
  }

  /**
   * Transforms the success value by applying the provided function that returns another {@link
   * Result}. Useful for chaining operations that can also fail.
   *
   * @param mapper Transformation function that returns a {@link Result}.
   * @param <U> The new type of the success value.
   * @return The result of applying the function or the original error.
   */
  default <U> Result<U, E> flatMap(Function<? super T, ? extends Result<U, E>> mapper) {
    return switch (this) {
      case Success<T, E> success -> mapper.apply(success.value());
      case Failure<T, E> failure -> Result.failure(failure.failure());
    };
  }

  /**
   * Executes the provided consumer if the result is successful.
   *
   * @param consumer Action to execute with the success value.
   * @return The same {@link Result} to allow chaining.
   */
  default Result<T, E> onSuccess(Consumer<? super T> consumer) {
    if (this instanceof Success(T value)) consumer.accept(value);
    return this;
  }

  /**
   * Executes the provided consumer if the result is an error.
   *
   * @param consumer Action to execute with the error.
   * @return The same {@link Result} to allow chaining.
   */
  default Result<T, E> onFailure(Consumer<? super E> consumer) {
    if (this instanceof Failure(E failure1)) consumer.accept(failure1);
    return this;
  }

  default <R> R fold(
      Function<? super T, ? extends R> successFn, Function<? super E, ? extends R> failureFn) {
    return switch (this) {
      case Success<T, E> success -> successFn.apply(success.value);
      case Failure<T, E> failure -> failureFn.apply(failure.failure);
    };
  }

  /**
   * Returns the value if successful, or the provided default value if it is an error.
   *
   * @param defaultValue Value to return in case of error.
   * @return The success value or the default value.
   */
  default T orElse(T defaultValue) {
    return switch (this) {
      case Success<T, E> success -> success.value;
      case Failure<T, E> _ -> defaultValue;
    };
  }

  /**
   * Returns the value if successful, or handles the error with the provided function.
   *
   * @param errorHandler Function to handle the error and return an alternative value.
   * @return The success value or the result of {@code errorHandler}.
   */
  default T orElseGet(Function<E, T> errorHandler) {
    return switch (this) {
      case Success<T, E> success -> success.value;
      case Failure<T, E> failure -> errorHandler.apply(failure.failure);
    };
  }

  default <X extends Throwable> T orElseThrow(Supplier<? extends X> exceptionSupplier) throws X {
    return switch (this) {
      case Success<T, E> success -> success.value;
      case Failure<T, E> _ -> throw exceptionSupplier.get();
    };
  }

  default <X extends Throwable> T orElseThrow(Function<E, ? extends X> exceptionSupplier) throws X {
    return switch (this) {
      case Success<T, E> success -> success.value;
      case Failure<T, E> failure -> throw exceptionSupplier.apply(failure.failure());
    };
  }

  /**
   * Successful implementation of {@link Result}.
   *
   * @param value The success value.
   * @param <T> Value type.
   * @param <E> Error type.
   */
  record Success<T, E extends DomainError>(T value) implements Result<T, E> {}

  /**
   * Error implementation of {@link Result}.
   *
   * @param failure The domain error.
   * @param <T> Value type.
   * @param <E> Error type.
   */
  record Failure<T, E extends DomainError>(E failure) implements Result<T, E> {}
}
