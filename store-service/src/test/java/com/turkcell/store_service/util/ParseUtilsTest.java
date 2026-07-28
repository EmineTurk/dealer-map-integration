package com.turkcell.store_service.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

class ParseUtilsTest {

	@Test
	void parseIdsSplitsAndTrims() {
		assertThat(ParseUtils.parseIds("1, 5,9")).containsExactly(1L, 5L, 9L);
	}

	@Test
	void parseIdsReturnsEmptyForBlank() {
		assertThat(ParseUtils.parseIds("  ")).isEmpty();
		assertThat(ParseUtils.parseIds(null)).isEmpty();
	}

	@Test
	void parseIdsRejectsNonNumeric() {
		assertThatThrownBy(() -> ParseUtils.parseIds("1,abc"))
				.isInstanceOf(NumberFormatException.class);
	}
}
