package dev.angelcorzo.nivo.jpa.parkinglots;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Struct;

@Builder(toBuilder = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
@Struct(name = "address_t", attributes = { "street", "city", "state", "country", "zip_code" })
public class AddressType {
  private String street;
  private String city;
  private String state;
  private String country;

  @Column(name = "zip_code")
  private String zipCode;
}
