package dev.angelcorzo.nivo.model.commons.result;

import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Supplier;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public final class ResultUtils {

  public static <T1, T2, R, E extends DomainError> Result<R, E> combine(
      Supplier<Result<T1, E>> first,
      Function<T1, Result<T2, E>> second,
      BiFunction<T1, T2, Result<R, E>> combiner) {

    Result<T1, E> firstResult = first.get();
    if (firstResult.isFailure()) return Result.failure(firstResult.getError());

    Result<T2, E> secondResult = second.apply(firstResult.get());
    if (secondResult.isFailure()) return Result.failure(secondResult.getError());

    return combiner.apply(firstResult.get(), secondResult.get());
  }

  public static <T1, T2, R, E extends DomainError> Result<R, E> combine(
      Supplier<Result<T1, E>> first,
      Supplier<Result<T2, E>> second,
      BiFunction<T1, T2, Result<R, E>> combiner) {

    Result<T1, E> firstResult = first.get();
    if (firstResult.isFailure()) return Result.failure(firstResult.getError());

    Result<T2, E> secondResult = second.get();
    if (secondResult.isFailure()) return Result.failure(secondResult.getError());

    return combiner.apply(firstResult.get(), secondResult.get());
  }
}
