ALTER TABLE "nivo_db".nivo.payments
    ALTER COLUMN status
        SET DEFAULT 'PENDING';


ALTER TABLE "nivo_db".nivo.payments
    DROP CONSTRAINT payments_status_check;


ALTER TABLE "nivo_db".nivo.payments
    DROP CONSTRAINT payments_payment_method_check;


ALTER TABLE "nivo_db".nivo.payments
    ADD CONSTRAINT payments_status_check CHECK (status in ('PENDING_CHECKOUT',
                                                           'PENDING_PAYMENT',
                                                           'PAID',
                                                           'FAILED',
                                                           'EXPIRED',
                                                           'CANCELLED',
                                                           'REFUNDED'));


ALTER TABLE "nivo_db".nivo.payments
    ADD CONSTRAINT payment_method_check CHECK (payment_method in ('PAY_LINK',
                                                                  'EFFECTIVE'));