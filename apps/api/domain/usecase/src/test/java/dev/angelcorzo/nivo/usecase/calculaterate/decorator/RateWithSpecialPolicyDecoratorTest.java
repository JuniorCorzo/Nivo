package dev.angelcorzo.nivo.usecase.calculaterate.decorator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import java.math.BigDecimal;
import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("RateWithSpecialPolicyDecorator Tests")
class RateWithSpecialPolicyDecoratorTest {

  private PriceDetailed createPriceDetailed(BigDecimal amount) {
    PriceDetailed itemized = PriceDetailed.of("Central Parking");
    itemized.addLine(new PriceLine("Base", amount));
    itemized.setIvaRate(BigDecimal.valueOf(0.19));
    return itemized;
  }

  @Nested
  @DisplayName("Price Modifications")
  class PriceModifications {

    @Test
    @DisplayName("Should subtract amount from price correctly")
    void shouldSubtractAmountFromPrice() {
      // Arrange
      RateComponent baseComponent = mock(RateComponent.class);
      PriceDetailed itemized = createPriceDetailed(BigDecimal.valueOf(10000));

      when(baseComponent.getPrice()).thenReturn(BigDecimal.valueOf(10000));
      when(baseComponent.getDuration()).thenReturn(Duration.ofHours(2));
      when(baseComponent.getItemizedPrices()).thenReturn(itemized);

      SpecialPoliciesReference policy =
          SpecialPoliciesReference.builder()
              .name("Discount 2000")
              .modifies(ModifiesTypes.PRICE)
              .operation(OperationsTypes.SUBTRACT)
              .valueToModify(BigDecimal.valueOf(2000))
              .build();

      // Act
      RateWithSpecialPolicyDecorator decorator =
          new RateWithSpecialPolicyDecorator(baseComponent, policy);

      // Assert
      assertThat(decorator.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(8000));
    }

    @Test
    @DisplayName("Should apply percentage discount to price correctly")
    void shouldApplyPercentageDiscountToPrice() {
      // Arrange
      RateComponent baseComponent = mock(RateComponent.class);
      PriceDetailed itemized = createPriceDetailed(BigDecimal.valueOf(10000));

      when(baseComponent.getPrice()).thenReturn(BigDecimal.valueOf(10000));
      when(baseComponent.getDuration()).thenReturn(Duration.ofHours(2));
      when(baseComponent.getItemizedPrices()).thenReturn(itemized);

      SpecialPoliciesReference policy =
          SpecialPoliciesReference.builder()
              .name("20% Off")
              .modifies(ModifiesTypes.PRICE)
              .operation(OperationsTypes.PERCENTAGE)
              .valueToModify(BigDecimal.valueOf(20))
              .build();

      // Act
      RateWithSpecialPolicyDecorator decorator =
          new RateWithSpecialPolicyDecorator(baseComponent, policy);

      // Assert
      assertThat(decorator.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(8000));
    }

    @Test
    @DisplayName("Should set fixed price correctly")
    void shouldSetFixedPrice() {
      // Arrange
      RateComponent baseComponent = mock(RateComponent.class);
      PriceDetailed itemized = createPriceDetailed(BigDecimal.valueOf(10000));

      when(baseComponent.getPrice()).thenReturn(BigDecimal.valueOf(10000));
      when(baseComponent.getDuration()).thenReturn(Duration.ofHours(2));
      when(baseComponent.getItemizedPrices()).thenReturn(itemized);

      SpecialPoliciesReference policy =
          SpecialPoliciesReference.builder()
              .name("Flat 5000")
              .modifies(ModifiesTypes.PRICE)
              .operation(OperationsTypes.SET)
              .valueToModify(BigDecimal.valueOf(5000))
              .build();

      // Act
      RateWithSpecialPolicyDecorator decorator =
          new RateWithSpecialPolicyDecorator(baseComponent, policy);

      // Assert
      assertThat(decorator.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(5000));
    }

    @Test
    @DisplayName("Should not return negative price when discount exceeds total")
    void shouldNotReturnNegativePrice() {
      // Arrange
      RateComponent baseComponent = mock(RateComponent.class);
      PriceDetailed itemized = createPriceDetailed(BigDecimal.valueOf(5000));

      when(baseComponent.getPrice()).thenReturn(BigDecimal.valueOf(5000));
      when(baseComponent.getDuration()).thenReturn(Duration.ofHours(1));
      when(baseComponent.getItemizedPrices()).thenReturn(itemized);

      SpecialPoliciesReference policy =
          SpecialPoliciesReference.builder()
              .name("Big Discount")
              .modifies(ModifiesTypes.PRICE)
              .operation(OperationsTypes.SUBTRACT)
              .valueToModify(BigDecimal.valueOf(10000))
              .build();

      // Act
      RateWithSpecialPolicyDecorator decorator =
          new RateWithSpecialPolicyDecorator(baseComponent, policy);

      // Assert
      assertThat(decorator.getPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    }
  }
}
