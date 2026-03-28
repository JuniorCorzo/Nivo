package dev.angelcorzo.nivo.model.payments.valueobject;

import lombok.Builder;

@Builder
public record GuestPayment(String email, String phone) {}
