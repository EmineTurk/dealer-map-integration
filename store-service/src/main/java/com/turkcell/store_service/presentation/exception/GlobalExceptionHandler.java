package com.turkcell.store_service.presentation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.turkcell.store_service.application.dto.ApiError;
import com.turkcell.store_service.domain.exception.StoreNotFoundException;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(StoreNotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(StoreNotFoundException ex) {
		ApiError body = ApiError.of(HttpStatus.NOT_FOUND.value(), ex.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ApiError> handleValidation(ConstraintViolationException ex) {
		String message = ex.getConstraintViolations().stream()
				.findFirst()
				.map(v -> v.getMessage())
				.orElse("Geçersiz istek parametresi");
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), message);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult().getFieldErrors().stream()
				.findFirst()
				.map(err -> err.getDefaultMessage() == null ? "Geçersiz istek gövdesi" : err.getDefaultMessage())
				.orElse("Geçersiz istek gövdesi");
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), message);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	@ExceptionHandler(NumberFormatException.class)
	public ResponseEntity<ApiError> handleNumberFormat(NumberFormatException ex) {
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), "Geçersiz ID formatı");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
}
