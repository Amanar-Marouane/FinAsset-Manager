'use client';
import { useEffect, useState } from 'react';
import useApi, { ApiResponse } from './use-api';
import { ROUTES } from '@/constants/routes';
import type { BuildingType } from '@/types';

interface UseBuildingTypesReturn {
    buildingTypes: BuildingType[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

const useBuildingTypes = (): UseBuildingTypesReturn => {
    const { trigger, error: apiError } = useApi();
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBuildingTypes = async () => {
        setIsLoading(true);
        setError(null);

        const response = await trigger<ApiResponse<BuildingType[]>>(ROUTES.buildingTypes.all, {
            method: 'get',
        });

        if (response.error) {
            setError(new Error(apiError?.message || 'Failed to fetch building types'));
            setBuildingTypes([]);
        } else if (response.data) {
            setBuildingTypes(response.data?.data || []);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchBuildingTypes();
    }, []);

    return {
        buildingTypes,
        isLoading,
        error,
        refetch: fetchBuildingTypes,
    };
};

export default useBuildingTypes;
