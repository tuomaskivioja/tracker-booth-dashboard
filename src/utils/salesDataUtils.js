export const filterSalesByOffer = (salesData, selectedOffer, filterType) => {
    return salesData.map((resource) => {
        let totalClicks = 0;
        let totalSales = 0;

        resource.offers.forEach((offer) => {
            if (selectedOffer === 'all' || offer.offer_name === selectedOffer) {
                totalClicks += offer.click_count;
                totalSales += offer.sale_count;
            }
        });

        return {
            ...resource,
            totalClicks,
            totalSales,
        };
    }).filter((resource) => {
        return (resource.totalClicks > 0 || resource.totalSales > 0) &&
               (filterType === 'all' || resource.category === filterType);
    });
};

export const sortSalesData = (salesData, sortConfig) => {
    if (sortConfig.key === null) return salesData;
    
    return [...salesData].sort((a, b) => {
        const aValue = Number(a[sortConfig.key]) || 0;
        const bValue = Number(b[sortConfig.key]) || 0;

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });
}; 