package com.turkcell.capability_service.presentation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.turkcell.capability_service.application.dto.ApiError;
import com.turkcell.capability_service.domain.exception.CapabilityTypeNotFoundException;
import com.turkcell.capability_service.infrastructure.client.StoreServiceUnavailableException;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(CapabilityTypeNotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(CapabilityTypeNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiError.of(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ApiError> handleValidation(ConstraintViolationException ex) {
		String message = ex.getConstraintViolations().stream()
				.findFirst()
				.map(v -> v.getMessage())
				.orElse("Geçersiz istek parametresi");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiError.of(HttpStatus.BAD_REQUEST.value(), message));
	}

	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiError.of(
						HttpStatus.BAD_REQUEST.value(),
						"Eksik parametre: " + ex.getParameterName()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiError.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
	}

	@ExceptionHandler(StoreServiceUnavailableException.class)
	public ResponseEntity<ApiError> handleStoreDown(StoreServiceUnavailableException ex) {
		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
				.body(ApiError.of(HttpStatus.SERVICE_UNAVAILABLE.value(), ex.getMessage()));
	}
}
