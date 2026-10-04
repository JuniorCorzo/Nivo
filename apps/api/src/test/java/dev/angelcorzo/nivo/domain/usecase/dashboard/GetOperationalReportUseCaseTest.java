package dev.angelcorzo.nivo.domain.usecase.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.OperationalReportModel;
import dev.angelcorzo.nivo.domain.model.dashboard.PageResult;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.OperationalReportGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.OperationalReportDTO;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GetOperationalReportUseCaseTest {

  @Mock
  private OperationalReportGateway reportGateway;

  @Mock
  private AuthenticationContextGateway authenticationContext;

  private GetOperationalReportUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase = new GetOperationalReportUseCase(reportGateway, authenticationContext);
  }

  @Test
  @DisplayName("execute(parkingId, page, size) debe resolver tenantId desde AuthenticationContextGateway")
  void shouldResolveTenantIdFromAuthenticationContextWhenExecutingPaginated() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final int page = 0;
    final int size = 20;

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final OperationalReportModel model = buildSampleModel(tenantId, parkingId);
    final PageResult<OperationalReportModel> pageResult = PageResult.<OperationalReportModel>builder()
        .content(List.of(model))
        .pageNumber(0)
        .pageSize(20)
        .totalElements(1L)
        .totalPages(1)
        .build();

    when(reportGateway.findOperationalReports(tenantId, parkingId, page, size)).thenReturn(pageResult);

    final PageResult<OperationalReportDTO> result = useCase.execute(parkingId, page, size);

    assertThat(result).isNotNull();
    assertThat(result.getContent()).hasSize(1);
    final OperationalReportDTO dto = result.getContent().getFirst();
    assertThat(dto.getTicketId()).isEqualTo(model.getTicketId());
    assertThat(dto.getLicensePlate()).isEqualTo("XYZ-789");
    assertThat(dto.getParkingName()).isEqualTo("Sede Principal");

    verify(authenticationContext).getCurrentTenantId();
    verify(reportGateway).findOperationalReports(tenantId, parkingId, page, size);
  }

  @Test
  @DisplayName("execute(tenantId, parkingId, page, size) debe consultar con tenantId explícito")
  void shouldQueryWithExplicitTenantIdWhenExecutingPaginated() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final int page = 1;
    final int size = 10;

    final OperationalReportModel model = buildSampleModel(tenantId, parkingId);
    final PageResult<OperationalReportModel> pageResult = PageResult.<OperationalReportModel>builder()
        .content(List.of(model))
        .pageNumber(1)
        .pageSize(10)
        .totalElements(11L)
        .totalPages(2)
        .build();

    when(reportGateway.findOperationalReports(tenantId, parkingId, page, size)).thenReturn(pageResult);

    final PageResult<OperationalReportDTO> result = useCase.execute(tenantId, parkingId, page, size);

    assertThat(result.getPageNumber()).isEqualTo(1);
    assertThat(result.getTotalElements()).isEqualTo(11L);
    verify(reportGateway).findOperationalReports(tenantId, parkingId, page, size);
  }

  @Test
  @DisplayName("executeForExport(parkingId) debe resolver tenantId desde AuthenticationContextGateway")
  void shouldResolveTenantIdFromAuthenticationContextWhenExporting() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final OperationalReportModel model = buildSampleModel(tenantId, parkingId);
    when(reportGateway.findAllForExport(tenantId, parkingId)).thenReturn(List.of(model));

    final List<OperationalReportDTO> result = useCase.executeForExport(parkingId);

    assertThat(result).hasSize(1);
    assertThat(result.getFirst().getTicketId()).isEqualTo(model.getTicketId());
    assertThat(result.getFirst().getTotalToCharge()).isEqualByComparingTo(new BigDecimal("15000"));

    verify(authenticationContext).getCurrentTenantId();
    verify(reportGateway).findAllForExport(tenantId, parkingId);
  }

  @Test
  @DisplayName("executeForExport(tenantId, parkingId) debe consultar con tenantId explícito")
  void shouldQueryWithExplicitTenantIdWhenExporting() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();

    final OperationalReportModel model = buildSampleModel(tenantId, parkingId);
    when(reportGateway.findAllForExport(tenantId, parkingId)).thenReturn(List.of(model));

    final List<OperationalReportDTO> result = useCase.executeForExport(tenantId, parkingId);

    assertThat(result).hasSize(1);
    verify(reportGateway).findAllForExport(tenantId, parkingId);
  }

  private OperationalReportModel buildSampleModel(final UUID tenantId, final UUID parkingId) {
    return OperationalReportModel.builder()
        .ticketId(UUID.randomUUID())
        .tenantId(tenantId)
        .parkingLotId(parkingId)
        .parkingName("Sede Principal")
        .licensePlate("XYZ-789")
        .slotNumber("A-01")
        .slotZone("Norte")
        .slotPrefix("A")
        .slotType("CAR")
        .rateName("Tarifa Estándar")
        .entryTime(OffsetDateTime.now().minusHours(2))
        .exitTime(OffsetDateTime.now())
        .durationMinutes(120.0)
        .ticketStatus("PAID")
        .totalToCharge(new BigDecimal("15000"))
        .paymentId(UUID.randomUUID())
        .paymentStatus("APPROVED")
        .paymentMethod("CREDIT_CARD")
        .paidAmount(new BigDecimal("15000"))
        .paymentDate(OffsetDateTime.now())
        .operatorOrUserName("Carlos Operador")
        .userEmail("carlos@nivo.com")
        .build();
  }
}
