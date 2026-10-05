package dev.angelcorzo.nivo.domain.model.payments.valueobject;

import lombok.Builder;

@Builder
public record GuestPayment(String email, String phone) {}
