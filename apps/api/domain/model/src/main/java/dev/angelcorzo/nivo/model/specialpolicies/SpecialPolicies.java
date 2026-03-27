package dev.angelcorzo.nivo.model.specialpolicies;
import dev.angelcorzo.nivo.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.model.specialpolicies.enums.OperationsTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class SpecialPolicies {
	private UUID id;
	private TenantReference tenant;
	private String name;
	private ModifiesTypes modifies;
	private OperationsTypes operation;
	private BigDecimal valueToModify;
	private boolean active;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
