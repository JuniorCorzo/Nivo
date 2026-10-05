package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto;

import java.time.OffsetDateTime;

public sealed interface BaseResponse permits Response, ResponseError {
	String status();
	String message();
	OffsetDateTime timestamp();
}
