package com.turkcell.capability_service.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CapabilityTypeTest {

	@Test
	void fromKeyParsesContractEnums() {
		assertThat(CapabilityType.fromKey("NEW_LINE")).isEqualTo(CapabilityType.NEW_LINE);
		assertThat(CapabilityType.fromKey("DEVICE_REPAIR")).isEqualTo(CapabilityType.DEVICE_REPAIR);
	}

	@Test
	void fromKeyReturnsNullForUnknownOrBlank() {
		assertThat(CapabilityType.fromKey("UNKNOWN")).isNull();
		assertThat(CapabilityType.fromKey(null)).isNull();
		assertThat(CapabilityType.fromKey("new_line")).isNull();
	}

	@Test
	void labelsMatchApiContract() {
		assertThat(CapabilityType.NEW_LINE.getLabel()).isEqualTo("Yeni Hat Başvurusu");
		assertThat(CapabilityType.DEVICE_DELIVERY.getLabel()).isEqualTo("Cihaz Teslim");
		assertThat(CapabilityType.DEVICE_REPAIR.getLabel()).isEqualTo("Cihaz Tamir / Teknik Servis");
		assertThat(CapabilityType.NUMBER_PORT.getLabel()).isEqualTo("Numara Taşıma");
		assertThat(CapabilityType.BILL_PAYMENT.getLabel()).isEqualTo("Fatura Ödeme");
	}
}
