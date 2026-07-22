package com.turkcell.stock_service.application.port.out;

import com.turkcell.stock_service.domain.model.Store;

import java.util.List;

public interface StoreQueryPort {

    List<Store> getStoresByIds(List<Long> storeIds);
}
